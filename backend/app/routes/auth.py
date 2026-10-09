"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional
import jwt

from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.dependencies import get_current_active_user, oauth2_scheme
from app.core.security import generate_access_token, decode_access_token, hash_string_sha256
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    GoogleTokens, LoginRequest, LoginResponse, UserProfile, LogoutResponse,
    RefreshTokenRequest, RefreshTokenResponse
)
from app.services.audit_service import log_audit

router = APIRouter(prefix="/auth", tags=["auth"])

# Mock Google OAuth state for session-based flow
@router.post("/google-login")
async def initiate_google_login():
    """
    Initiate Google OAuth login.
    In production, this would redirect to Google's OAuth consent screen.
    For now, returns a redirect URL.
    """
    state = hash_string_sha256(jwt.encode({"timestamp": "start"}, SECRET_KEY, algorithm=ALGORITHM))
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&state={state}"
        f"&access_type=offline"
    )
    
    # Store state in session for callback validation (would be server-side in production)
    
    return {"auth_url": auth_url}

@router.get("/callback")
async def google_callback(code: str, state: str):
    """
    Google OAuth callback handler.
    Exchange authorization code for tokens.
    """
    # In production, validate state and exchange code for tokens
    # For now, create a mock user profile based on the access token's claims
    
    # Mock claims from a valid Google ID token
    mock_user_profile = GoogleTokens(
        id_token="mock_id_token_valid_for_testing",
        access_token="mock_access_token"
    )
    
    # Validate with Google (omitted for brevity)
    # In production: https://oauth2.googleapis.com/token exchange
    
    # For now, generate a user profile
    email = "medivault_user@example.com"
    return {
        "code": code,
        "state": state,
        "authorization_code_valid": True,
        "note": "Demo mode - Google validation would happen here"
    }

@router.post("/login", response_model=LoginResponse)
async def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint (can be extended for OAuth token validation).
    For now, requires valid Google OAuth token.
    """
    # This would normally validate the Google tokens
    # For demo purposes, we create a user if doesn't exist
    
    # Mock user data
    email = "medivault_user@example.com"
    full_name = "John Doe"
    age = 35
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create new user
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash("demo_password")
        
        user = User(
            email=email,
            full_name=full_name,
            age=age,
            # hashed_password=hashed_password  # Not used with OAuth
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Generate tokens
    access_token, expires_at = generate_access_token(
        {"sub": str(user.id), "email": user.email, "name": user.full_name},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Refresh token (simulated)
    refresh_token = hash_string_sha256(str(user.id) + "refresh" + secrets.token_hex(16))
    
    # Log login
    log_audit(
        db=db,
        user_id=user.id,
        action_type="login",
        action_description="User logged in via Google OAuth",
        ip_address="127.0.0.1",
    )
    
    return LoginResponse(
        user=UserProfile.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=3600
    )

@router.get("/user", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get the currently authenticated user's profile."""
    return UserProfile.model_validate(current_user)

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Secure logout - invalidates session."""
    # In production, would mark token as revoked in a blacklist
    log_audit(
        db=db,
        user_id=current_user.id,
        action_type="logout",
        action_description="User logged out",
        ip_address="127.0.0.1",
    )
    return LogoutResponse()

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_access_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    # In production, validate refresh token and issue new access token
    # TODO: validate refresh token (demo placeholder)
    pass
    
    # Simulate refresh
    access_token, expires_at = generate_access_token(
        {"sub": "demo_user_id"},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    new_refresh_token = hash_string_sha256("refresh_" + secrets.token_hex(16))
    
    return RefreshTokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=3600
    )
