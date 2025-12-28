from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi import UploadFile

class ChatMessage(BaseModel):
    prompt: str
    role: str

class ChatRequest(BaseModel):
    """The frontend now sends the prompt, role, and an optional conversation ID and category."""
    prompt: str
    role: str
    conversation_id: Optional[str] = None
    document_category: Optional[str] = None

class ChatResponse(BaseModel):
    """The backend now returns the AI response AND the conversation ID."""
    role: str = Field(default="ai")
    prompt: str
    conversation_id: str

class ReviewResponse(BaseModel):
    ai_response: str
    conversation_id: str

class FrontendFileDetail(BaseModel):
    """A simplified model for file details sent from the frontend."""
    name: str

class FrontendChatMessage(BaseModel):
    """A simplified model for chat messages sent from the frontend."""
    role: str
    prompt: str
    files: Optional[List[FrontendFileDetail]] = None