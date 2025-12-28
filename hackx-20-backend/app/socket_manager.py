import asyncio
import socketio
from app.core.security import get_current_user_id # Using our existing JWT logic
from app.services.history_service import history_service_instance
from app.services import (
    rag_orchestrator_instance
)
from app.services.file_service import file_service_instance # We might need this for file uploads later
from app.services.mongo_service import mongo_service_instance

# A dictionary to hold session-specific data.
# In a production app with multiple server instances, use Redis instead.
session_storage = {}

# Create the main server instance
sio_server = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio_server.event
async def connect(sid, environ, auth):
    """Handles a new client connection and performs authentication."""
    try:
        if not auth or 'token' not in auth:
            raise ConnectionRefusedError("Authentication token is required.")
        
        # Use our existing function to validate the token
        # Note: get_current_user_id is a dependency function, we call it directly here.
        user_id = get_current_user_id(auth['token'])
        
        # Store user_id in the socket session
        await sio_server.save_session(sid, {'user_id': user_id})
        
        print(f"Client connected: {sid}, User: {user_id}")
        return True # Connection successful
    except Exception as e:
        print(f"Authentication failed for {sid}: {e}")
        raise ConnectionRefusedError("Authentication failed") # Refuse connection

@sio_server.on('start_chat_session')
async def start_chat_session(sid, data):
    """
    Client calls this to load a conversation or start a new one.
    This also puts the user into a dedicated 'room' for this chat.
    """
    try:
        session = await sio_server.get_session(sid)
        user_id = session['user_id']
        conversation_id = data.get('conversation_id') # Can be None for a new chat

        conversation_id, history = await history_service_instance.get_or_create_history(
            user_id=user_id,
            conversation_id=conversation_id
        )

        # Store conversation details for this socket connection
        session['conversation_id'] = conversation_id
        session['history'] = history
        await sio_server.save_session(sid, session)

        # Create and join a unique room for this chat session
        room = f"chat_{conversation_id}"
        sio_server.enter_room(sid, room)

        print(f"Client {sid} (User: {user_id}) joined room: {room}")
        # Send confirmation back to the client
        await sio_server.emit('session_started', {
            'conversation_id': conversation_id,
            'message': f'Session started for conversation {conversation_id}.'
        }, to=sid)

    except Exception as e:
        print(f"Error starting chat session for {sid}: {e}")
        await sio_server.emit('error', {'message': 'Could not start chat session.'}, to=sid)


@sio_server.on('user_message')
async def handle_user_message(sid, data):
    """Handles an incoming message from an authenticated user."""
    try:
        session = await sio_server.get_session(sid)
        user_id = session.get('user_id')

        is_allowed = await mongo_service_instance.check_and_update_rate_limit(user_id)
        if not is_allowed:
            await sio_server.emit('error', {
                'message': 'You have exceeded your daily request limit. Please try again tomorrow.'
            }, to=sid)
            return # Stop processing immediately

        conversation_id = session.get('conversation_id')
        history = session.get('history', [])

        if not user_id or not conversation_id:
            await sio_server.emit('error', {'message': 'Chat session not started.'}, to=sid)
            return

        prompt = data.get('prompt')
        document_category = data.get('document_category')
        
        # Add user message to history immediately
        history.append({'role': 'user', 'parts': [{'text': prompt}]})
        session['history'] = history
        await sio_server.save_session(sid, session)

        asyncio.create_task(
            process_message_and_respond(sid, prompt, document_category, history, conversation_id)
        )

    except Exception as e:
        print(f"Error processing user message from {sid}: {e}")
        await sio_server.emit('error', {'message': 'An error occurred while processing your message.'}, to=sid)


async def process_message_and_respond(sid, prompt, scope, history, conversation_id):
    """A helper function to run the AI logic and emit results back to the client."""
    try:
        # We can emit status updates here in the future
        # await sio_server.emit('status', {'message': 'Searching knowledge base...'}, to=sid)
        
        reply_text = await rag_orchestrator_instance.get_response(
            query=prompt,
            history=history,
            scope=scope,
            uploaded_file=None # File handling needs a separate flow
        )

        # Add AI response to history
        history.append({'role': 'ai', 'parts': [{'text': reply_text}]})
        
        # Update the session with the latest history
        session = await sio_server.get_session(sid)
        session['history'] = history
        await sio_server.save_session(sid, session)
        
        # Send the final response to the client
        await sio_server.emit('ai_response', {
            'ai_response': reply_text,
            'conversation_id': conversation_id
        }, to=sid)

    except Exception as e:
        print(f"Error during background AI processing: {e}")
        await sio_server.emit('error', {'message': 'An error occurred during AI processing.'}, to=sid)


@sio_server.event
async def disconnect(sid):
    """Handles a client disconnecting."""
    print(f"Client disconnected: {sid}")
    session = await sio_server.get_session(sid)
    
    # --- The Save-on-Disconnect Logic ---
    if session and session.get("user_id") and session.get("conversation_id"):
        user_id = session["user_id"]
        conversation_id = session["conversation_id"]
        history = session["history"]
        
        print(f"Saving final conversation state for {conversation_id} to persistent storage.")
        # This function already saves to JSON and then to MongoDB in the background.
        history_service_instance.save_history(user_id, conversation_id, history)
    
    print(f"Session cleaned up for {sid}.")