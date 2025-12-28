import hashlib
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from ..schemas.chat_schemas import ChatResponse, FrontendFileDetail, FrontendChatMessage
from ....services.mongo_service import mongo_service_instance
from ....services import rag_orchestrator_instance
from ....services.history_service import history_service_instance
from ....services.file_service import file_service_instance
from ....core.security import get_current_user_id
from typing import Optional, List, Dict, Any
import traceback

router = APIRouter()

def get_orchestrator(): return rag_orchestrator_instance
def get_history_service(): return history_service_instance
def get_file_service(): return file_service_instance

@router.get("/conversations", response_model=List[Dict[str, str]])
async def get_user_conversations(
    user_id: str = Depends(get_current_user_id),
    history_service = Depends(get_history_service)
):
    """Retrieves a list of all conversation IDs and titles for the current user."""
    return await history_service.get_user_conversations(user_id)

@router.get("/history/{conversation_id}", response_model=List[FrontendChatMessage])
async def get_conversation_history(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    history_service = Depends(get_history_service)
):
    """
    Retrieves the simplified, frontend-friendly message history for a conversation
    directly from storage.
    """
    # 1. Call our new method to get the data in the exact format we need.
    stored_history = await history_service.get_stored_conversation(
        user_id=user_id,
        conversation_id=conversation_id
    )

    # 2. If nothing was found, return an empty list.
    if stored_history is None:
        return []

    # 3. The data is already in the correct format. No translation needed.
    #    Just return it. Pydantic/FastAPI will handle validation and serialization.
    return stored_history

@router.post("/chat", response_model=ChatResponse)
async def unified_chat_endpoint(
    user_id: str = Depends(get_current_user_id),
    prompt: Optional[str] = Form(None),
    role: str = Form("user"),
    conversation_id: Optional[str] = Form(None),
    document_category: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    orchestrator = Depends(get_orchestrator),
    history_service = Depends(get_history_service),
    file_service = Depends(get_file_service)
):
    if not prompt and not file:
        raise HTTPException(status_code=400, detail="A prompt or a file must be provided.")
    
    is_allowed = await mongo_service_instance.check_and_update_rate_limit(user_id)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You have exceeded your daily request limit. Please try again tomorrow."
        )

    # If a file is provided with no text prompt, use a default prompt.
    user_prompt = prompt or "Analyze this file and provide a detailed summary of its contents and key points."

    # History operations are now scoped by the authenticated user_id
    conversation_id, history = await history_service.get_or_create_history(
        user_id=user_id,
        conversation_id=conversation_id
    )

    gemini_file = None
    file_hash = None
    if file:
        print(f"Received file: {file.filename} of type {file.content_type}")
        content = await file.read()
        file_hash = hashlib.sha256(content).hexdigest()

        # Check if a file with the same hash was already processed in this conversation
        for msg in history:
            for part in msg.get("parts", []):
                if isinstance(part, dict) and part.get("file_hash") == file_hash:
                    gemini_file_name = part["file_name"]
                    # Re-fetch the file object using its name for the API call
                    gemini_file = file_service.client.files.get(name=gemini_file_name)
                    print(f"Reusing existing file: {gemini_file.name}")
                    break
            if gemini_file:
                break
        
        if not gemini_file:
            await file.seek(0)
            # Pass the content type to the upload service
            gemini_file = await file_service.upload_file(file=file)
            print(f"Uploaded new file: {gemini_file.name}")

    try:
        # The main model will now handle file analysis directly.
        reply_text = await orchestrator.get_response(
            query=user_prompt,
            history=history,
            scope=document_category,
            uploaded_file=gemini_file # Pass the native file object
        )
        
        # Construct the user message for history
        user_message_parts = [{'text': user_prompt}]
        if gemini_file:
            # Store the file's unique name and hash in our history for reuse.
            user_message_parts.append({'file_name': gemini_file.name, 'file_hash': file_hash})
        
        user_message = {'role': role, 'parts': user_message_parts}
        history.append(user_message)

        model_message = {'role': 'ai', 'parts': [{'text': reply_text}]}
        history.append(model_message)

        # Save history using the user_id
        history_service.save_history(
            user_id=user_id,
            conversation_id=conversation_id,
            history=history
        )

        return ChatResponse(
            prompt=reply_text,
            conversation_id=conversation_id
        )
    except Exception as e:
        print(f"Unhandled error in chat endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An internal server error occurred.")