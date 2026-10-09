"""Private key service."""

from sqlalchemy.orm import Session
from datetime import datetime

def create_new_private_key(
    db: Session,
    user_id: str,
    hospital_id: str
):
    """
    Create a new private key for a user-hospital pair.
    Returns the new key index that can be saved securely.
    """
    from app.models.private_key import PrivateKey
    from app.core.security import generate_private_key_index
    import secrets
    
    # Generate a secure key index format
    # Format: PV-{YYYYMMDD}-{random_bytes}
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_bytes = secrets.token_hex(4)
    key_index = f"PV-{timestamp}-{random_bytes}"
    
    new_key = PrivateKey(
        user_id=user_id,
        hospital_id=hospital_id,
        hospital_private_key_index=key_index
    )
    
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    
    return new_key

def get_user_private_keys(db: Session, user_id: str):
    """Get all active private keys for a user."""
    from app.models.private_key import PrivateKey
    return db.query(PrivateKey).filter(
        PrivateKey.user_id == user_id,
        PrivateKey.is_active == True
    ).all()

def get_key(db: Session, key_id: str, user_id: str):
    """Get a specific private key for a user."""
    from app.models.private_key import PrivateKey
    return db.query(PrivateKey).filter(
        PrivateKey.id == key_id,
        PrivateKey.user_id == user_id,
        PrivateKey.is_active == True
    ).first()

def revoke_private_key(db: Session, key_id: str, reason: str):
    """Revoke a private key with reason for audit compliance."""
    from app.models.private_key import PrivateKey
    
    key = db.query(PrivateKey).filter(
        PrivateKey.id == key_id
    ).first()
    
    if key:
        key.is_active = False
        key.last_rotation_at = datetime.utcnow()
    
    return key
