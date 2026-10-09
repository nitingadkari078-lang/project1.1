"""Authentication Pydantic schemas."""

from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
import uuid

class GoogleTokens(BaseModel):
    id_token: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None

class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: EmailStr
    full_name: str
    age: Optional[int] = None
    phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class LoginRequest(BaseModel):
    google_tokens: GoogleTokens

class LoginResponse(BaseModel):
    user: UserProfile
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600

class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int = 3600
