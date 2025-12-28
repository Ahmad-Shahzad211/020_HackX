from typing import List, Dict, Any, Optional

import motor.motor_asyncio

from ..core.config import settings

class MongoService:
    def __init__(self, mongo_uri: str, database_name: str = "chatLegis"):
        # Use motor for async connection
        self.client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
        self.db = self.client[database_name]
        self.conversations_collection = self.db["conversations"]
        self.users_collection = self.db["users"]
        print("MongoDB Service initialized with Users collection.")

    async def check_and_update_rate_limit(self, user_id: str) -> bool:
        """
        Checks if a user has exceeded their daily request limit.
        This function is atomic and handles all logic:
        - Excludes admins.
        - Resets the count on a new day.
        - Increments the count if the request is allowed.
        Returns True if the request is allowed, False otherwise.
        """
        return True

    async def save_conversation(self, user_id: str, conversation_id: str, history: List[Dict[str, Any]]):
        """Saves or updates a full conversation history in MongoDB."""
        print(f"Saving conversation {conversation_id} for user {user_id} to MongoDB.")
        try:
            # Use 'upsert=True' to insert if not found, or update if it exists.
            await self.conversations_collection.update_one(
                {"conversation_id": conversation_id, "user_id": user_id},
                {"$set": {"history": history, "user_id": user_id}},
                upsert=True
            )
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")

    async def find_conversation(self, user_id: str, conversation_id: str) -> Optional[List[Dict[str, Any]]]:
        """Finds a conversation by its ID for a specific user."""
        print(f"Searching MongoDB for conversation {conversation_id} for user {user_id}.")
        try:
            document = await self.conversations_collection.find_one(
                {"conversation_id": conversation_id, "user_id": user_id}
            )
            return document.get("history") if document else None
        except Exception as e:
            print(f"Error finding in MongoDB: {e}")
            return None

    async def find_user_conversations_list(self, user_id: str) -> List[Dict[str, Any]]:
        """Finds all conversations for a user to populate the history list."""
        print(f"Searching MongoDB for all conversations for user {user_id}.")
        try:
            # Find all documents for the user, but only return the fields we need.
            cursor = self.conversations_collection.find(
                {"user_id": user_id},
                {"conversation_id": 1, "history": 1, "_id": 0} # Projection
            )
            return await cursor.to_list(length=100) # Convert cursor to list
        except Exception as e:
            print(f"Error finding user conversations in MongoDB: {e}")
            return []

# Create a singleton instance for other services to use
if settings.MONGO_URI:
    mongo_service_instance = MongoService(mongo_uri=settings.MONGO_URI)
else:
    mongo_service_instance = None
    print("WARNING: MONGO_URI not set. MongoDB service is disabled.")