from fastapi import APIRouter
from .routes import chat
api_router_v1 = APIRouter()
api_router_v1.include_router(chat.router, prefix="/chatlegis", tags=["ChatLegis"])