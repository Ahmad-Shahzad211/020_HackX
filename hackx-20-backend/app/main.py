import socketio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.socket_manager import sio_server

from app.api.v1.routes import auth
from app.core.config import settings

from app.api.v1 import api_router_v1

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- ADD THIS DEBUGGING MIDDLEWARE ---
@app.middleware("http")
async def log_raw_request_body(request: Request, call_next):
    # This middleware will run for every single request.
    if request.url.path == "/api/v1/chatlegis/chat": # Only log for our specific endpoint
        print("--- INTERCEPTED /chat REQUEST ---")
        headers = dict(request.headers)
        print(f"Request Headers: {headers}")
        body = await request.body()
        print(f"RAW Request Body (bytes): {body}")
        print("--- END INTERCEPTION ---")

    # This part is crucial to make sure the request continues normally
    response = await call_next(request)
    return response
# ------------------------------------

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router_v1, prefix=settings.API_V1_STR, deprecated=True)
app.include_router(auth.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}. Please connect via Socket.IO."}

final_app = socketio.ASGIApp(sio_server, other_asgi_app=app)