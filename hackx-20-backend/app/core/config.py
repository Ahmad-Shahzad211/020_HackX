from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "302"
    API_V1_STR: str = "/api/v1"
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None 
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    
    MONGO_URI: str
    HISTORY_DIR: str = "chat_histories"

    JWT_SECRET_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()