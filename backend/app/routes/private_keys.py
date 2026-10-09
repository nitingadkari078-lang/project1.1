"""Private Key routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.config import EMERGENCY_ACCESS_MAX_HOURS
from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.models.private_key import PrivateKey
from app.schemas.hospitals import HospitalResponse
from app.schemas.private_keys import PrivateKeySchema
from app.services.audit_service import log_audit

router = APIRouter(prefix="/private-keys", tags=["private-keys"])

@router.get("", response_model=List[HospitalResponse])
async def get_private_keys(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all hospital private keys for the current user.
    Returns hospitals the patient has a private key for.
    """
    keys = db.query(PrivateKey).filter(
        PrivateKey.user_id == current_user.id,
        PrivateKey.is_active == True
    ).all()
    
    hospitals = []
    for key in keys:
        hospital = db.query(Hospital).filter(Hospital.id == key.hospital_id).first()
        if hospital:
            hospitals.append(HospitalResponse(
                id=hospital.id,
                hospital_id=hospital.hospital_id,
                hospital_name=hospital.hospital_name,
                city=hospital.city,
                status=hospital.status,
                has_active_private_key=True,
                has_visit_history=False  # Would fetch visit count
            ))
    
    return hospitals

@router.get("/{key_id}", response_model=PrivateKeySchema)
async def get_private_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific private key details (admin use).
    For patient view, they see their keys grouped by hospital.
    """
    # In production, patient can only view keys for their visits
    key = db.query(PrivateKey).filter(
        PrivateKey.id == key_id,
        PrivateKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Private key not found"
        )
    
    # Only return key if user is authorized
    hospital = db.query(Hospital).filter(Hospital.id == key.hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found"
        )
    
    return PrivateKeySchema(
        id=key.id,
        hospital_id=hospital.hospital_id,
        hospital_name=hospital.hospital_name,
        key_index=key.hospital_private_key_index,
        age=15,  # Would calculate from first use
        generated_at=key.generated_at.isoformat(),
        expires_at=key.expires_at.isoformat() if key.expires_at else None,
        is_active=key.is_active
    )

# New revoke endpoint
@router.post("/{key_id}/revoke", response_model=dict)
async def revoke_private_key(
    key_id: str,
    reason: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Revoke a hospital's private key.
    Requires a reason for audit compliance.
    """
    key = db.query(PrivateKey).filter(
        PrivateKey.id == key_id,
        PrivateKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Private key not found"
        )
    
    if not key.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Private key is already inactive"
        )
    
    # Deactivate the key
    key.is_active = False
    db.commit()
    
    # Log the revocation
    log_audit(
        db=db,
        user_id=current_user.id,
        hospital_id=key.hospital_id,
        action_type="private_key_revoked",
        action_description=f"Revoked private key from hospital: {reason}",
        ip_address="127.0.0.1",  # For demo
        metadata={"key_id": str(key_id), "reason": reason}
    )
    
    return {
        "success": True,
        "message": "Private key revoked successfully"
    }
