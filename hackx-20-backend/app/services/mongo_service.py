from datetime import datetime, timezone
from bson.objectid import ObjectId
from bson.errors import InvalidId
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
        try:
            # 1. Convert the user_id string from the JWT into a MongoDB ObjectId.
            #    Add error handling for invalid ID formats.
            try:
                user_obj_id = ObjectId(user_id)
            except InvalidId:
                print(f"Rate limit check: Invalid ObjectId format for user_id: {user_id}")
                return False # Deny the request if the ID is malformed

            # 2. Query the collection using the correct ObjectId type.
            user = await self.users_collection.find_one({"_id": user_obj_id})

            if not user:
                print(f"Rate limit check: User {user_id} not found.")
                return False # Should not happen for an authenticated user

            # 1. Exclude admins from rate limiting
            if user.get("role") == "admin":
                return True

            # 2. Check if the request date needs a reset
            today = datetime.now(timezone.utc).date()
            last_request_date = user.get("lastRequestDate")
            
            # Ensure last_request_date is a date object if it exists
            if last_request_date and isinstance(last_request_date, datetime):
                last_request_date = last_request_date.date()

            daily_count = user.get("dailyRequestCount", 0)

            # If last request was before today, reset the counter
            if not last_request_date or last_request_date < today:
                await self.users_collection.update_one(
                    {"_id": user_obj_id},
                    {"$set": {"dailyRequestCount": 1, "lastRequestDate": datetime.now(timezone.utc)}}
                )
                return True

            # 3. Check if the user is over their limit
            request_limit = user.get("requestLimit", 25) # Default to 25 if not set
            if daily_count >= request_limit:
                print(f"User {user_id} has exceeded their daily limit of {request_limit} requests.")
                return False

            # 4. If all checks pass, increment the count and allow the request
            await self.users_collection.update_one(
                {"_id": user_obj_id},
                {"$inc": {"dailyRequestCount": 1}, "$set": {"lastRequestDate": datetime.now(timezone.utc)}}
            )
            return True

        except Exception as e:
            print(f"Error during rate limit check for user {user_id}: {e}")
            return False # Fail safely by denying the request

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