import uuid
import json
import os
from typing import List, Dict, Any, Tuple, Optional
from ..core.config import settings
import asyncio
from .mongo_service import mongo_service_instance

class HistoryService:
    def __init__(self, base_dir: str, mongo_service):
        self.base_dir = base_dir
        self.mongo_service = mongo_service
        os.makedirs(self.base_dir, exist_ok=True)
        print(f"HistoryService initialized with hydration/dehydration logic.")

    # --- NEW HELPER METHOD: DEHYDRATION ---
    def _dehydrate_history_for_storage(self, history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Converts the internal 'parts' format to the simple 'prompt'/'files' format for storage."""
        dehydrated_history = []
        for message in history:
            text_parts = []
            file_parts = []
            for part in message.get("parts", []):
                if "text" in part:
                    text_parts.append(part["text"])
                elif "file_name" in part:
                    # Storing the full file detail for potential future use
                    file_parts.append({
                        "name": part["file_name"],
                        "hash": part.get("file_hash")
                    })
            
            prompt_text = "\n".join(text_parts)
            
            new_message = {"role": message["role"], "prompt": prompt_text}
            if file_parts:
                new_message["files"] = file_parts
            
            dehydrated_history.append(new_message)
        return dehydrated_history

    # --- NEW HELPER METHOD: HYDRATION ---
    def _hydrate_history_for_gemini(self, stored_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Converts the simple stored format back to the internal 'parts' format for AI processing."""
        hydrated_history = []
        for message in stored_history:
            parts = []
            if message.get("prompt"):
                parts.append({"text": message["prompt"]})
            
            if message.get("files"):
                for file_info in message["files"]:
                    parts.append({
                        "file_name": file_info["name"],
                        "file_hash": file_info.get("hash")
                    })
            
            hydrated_history.append({"role": message["role"], "parts": parts})
        return hydrated_history

    def _get_user_dir(self, user_id: str) -> str:
        user_dir = os.path.join(self.base_dir, user_id)
        os.makedirs(user_dir, exist_ok=True)
        return user_dir

    def _get_history_path(self, user_id: str, conversation_id: str) -> str:
        user_dir = self._get_user_dir(user_id)
        return os.path.join(user_dir, f"{conversation_id}.json")

    async def get_stored_conversation(self, user_id: str, conversation_id: str) -> Optional[List[Dict[str, Any]]]:
        """
        Retrieves the raw, dehydrated conversation history as it is stored.
        Checks local JSON first, then falls back to MongoDB.
        This is ideal for sending data directly to the frontend.
        """
        # 1. Try local JSON first (it's already in the simple format)
        stored_history = self.get_single_conversation_from_json(user_id, conversation_id)
        if stored_history is not None:
            return stored_history
        
        # 2. If not found, try MongoDB (also in the simple format)
        if self.mongo_service:
            stored_history = await self.mongo_service.find_conversation(user_id, conversation_id)
            if stored_history is not None:
                # Cache it locally for next time, still in simple format
                self.save_history_to_json(user_id, conversation_id, stored_history)
                return stored_history
        
        # 3. If not found anywhere, return None
        return None

    async def get_or_create_history(self, user_id: str, conversation_id: Optional[str] = None) -> Tuple[str, List[Dict[str, Any]]]:
        """Retrieves and HYDRATES chat history for use by the application."""
        if conversation_id:
            # 1. Try local JSON first
            stored_history = self.get_single_conversation_from_json(user_id, conversation_id)
            if stored_history is not None:
                print(f"Loaded and hydrated conversation {conversation_id} from local JSON.")
                return conversation_id, self._hydrate_history_for_gemini(stored_history)
            
            # 2. If not found, try MongoDB
            if self.mongo_service:
                stored_history = await self.mongo_service.find_conversation(user_id, conversation_id)
                if stored_history is not None:
                    print(f"Restored and hydrated conversation {conversation_id} from MongoDB.")
                    hydrated_history = self._hydrate_history_for_gemini(stored_history)
                    # Save the dehydrated version back to local JSON for fast access
                    self.save_history_to_json(user_id, conversation_id, stored_history)
                    return conversation_id, hydrated_history
            
            return conversation_id, []
        else:
            new_conversation_id = str(uuid.uuid4())
            return new_conversation_id, []

    def save_history_to_json(self, user_id: str, conversation_id: str, history_to_save: List[Dict[str, Any]]):
        """Saves a DEHYDRATED conversation history to its corresponding JSON file."""
        history_path = self._get_history_path(user_id, conversation_id)
        print(f"Saving dehydrated history for '{conversation_id}' to '{history_path}'")
        try:
            with open(history_path, 'w', encoding='utf-8') as f:
                json.dump(history_to_save, f, indent=4)
        except OSError as e:
            print(f"Error saving history file {history_path}: {e}")
            
    def save_history(self, user_id: str, conversation_id: str, history: List[Dict[str, Any]]):
        """DEHYDRATES history and saves it to local JSON and MongoDB."""
        dehydrated_history = self._dehydrate_history_for_storage(history)
        
        self.save_history_to_json(user_id, conversation_id, dehydrated_history)
        
        if self.mongo_service:
            asyncio.create_task(
                self.mongo_service.save_conversation(user_id, conversation_id, dehydrated_history)
            )

    def get_single_conversation_from_json(self, user_id: str, conversation_id: str) -> Optional[List[Dict[str, Any]]]:
        """Loads a single DEHYDRATED conversation history from the local JSON file."""
        history_path = self._get_history_path(user_id, conversation_id)
        if not os.path.exists(history_path):
            return None
        try:
            with open(history_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return None

    async def get_user_conversations(self, user_id: str) -> List[Dict[str, str]]:
        """Lists all conversations for a user from MongoDB, using the simple stored format."""
        if not self.mongo_service:
            return []

        conversations = []
        try:
            mongo_conversations = await self.mongo_service.find_user_conversations_list(user_id)
            for convo in mongo_conversations:
                history = convo.get("history", [])
                title = "Untitled Conversation"
                if history:
                    for msg in history:
                        # --- Logic updated for new format ---
                        if msg.get('role') == 'user' and msg.get('prompt'):
                            title = msg['prompt'].strip()[:50] + "..."
                            break
                
                conversations.append({"id": convo["conversation_id"], "title": title})
            
            return sorted(conversations, key=lambda x: x['id'], reverse=True)
        except Exception as e:
            print(f"Error getting user conversations from DB: {e}")
            return []

history_service_instance = HistoryService(
    base_dir=settings.HISTORY_DIR,
    mongo_service=mongo_service_instance
)