"""
Security utilities for MediVault
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password for storage."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def generate_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> tuple[str, datetime]:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secrets.token_hex(32), algorithm="HS256")
    return encoded_jwt, expire

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, secrets.token_hex(32), algorithms=["HS256"])
        return payload
    except JWTError:
        return None

def hash_string_sha256(s: str) -> str:
    """Hash a string using SHA-256."""
    return hashlib.sha256(s.encode()).hexdigest()

def generate_secure_random_key(length: int = 32) -> str:
    """Generate a cryptographically secure random key."""
    return secrets.token_urlsafe(length)

def generate_private_key_index() -> str:
    """Generate a hospital-specific private key index for a patient."""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_part = secrets.token_hex(4)
    return f"PV-{timestamp}-{random_part}"
