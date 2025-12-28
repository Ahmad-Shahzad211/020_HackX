import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from ....core.config import settings

router = APIRouter()

@router.post("/token", tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Temporary endpoint to generate a JWT for a test user.
    In a real application, you would validate form_data.username and form_data.password
    against a user database. For now, any username/password will work.
    """
    if not settings.JWT_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY is not configured."
        )

    # For testing, we'll create a token for a hardcoded user ID.
    user_id = "test_user_001" 
    
    # Token expires in 1 day
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    
    to_encode = {
        "sub": user_id,
        "id": user_id,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    
    return {"access_token": encoded_jwt, "token_type": "bearer"}