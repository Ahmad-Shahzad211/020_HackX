from hashlib import algorithms_available
import os
import jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    Dependency to decode JWT token, validate it, and return the user_id.
    This will be injected into the endpoint.
    """
    print(f"Token recieved: {token}")
    if not settings.JWT_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET_KEY is not configured on the server."
        )
    print(f"JWT TOKEN was found")
    try:
        print(f"Decoding")
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        print(f"Decoded Payload: {payload}")
        user_id: Optional[str] = payload.get("id")

        print(f"User_ID recieved: {user_id}\n Payload: {payload}")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT token does not contain id."
            )
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token has expired."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token is invalid."
        )
