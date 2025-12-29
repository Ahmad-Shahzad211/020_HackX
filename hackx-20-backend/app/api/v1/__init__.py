from fastapi import APIRouter
from .routes import chat, admin
api_router_v1 = APIRouter()
api_router_v1.include_router(chat.router, prefix="/chatlegis", tags=["ChatLegis"])
api_router_v1.include_router(admin.router, prefix="/admin", tags=["Admin"])