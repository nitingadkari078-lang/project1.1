"""Emergency access routes."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.models.emergency_access import EmergencyAccess
from app.models.emergency_data import EmergencyLimitedData
from app.schemas.emergency import EmergencyAccessResponse, EmergencyDataResponse
from app.services.audit_service import log_audit

router = APIRouter(prefix="/emergency", tags=["emergency"], dependencies=[Depends(get_current_active_user)])

@router.post("/access-requests", response_model=EmergencyAccessResponse)
async def create_emergency_request(request: dict,
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Create a new emergency access request from another hospital."""
    hospital = db.query(Hospital).filter(Hospital.hospital_id == request["requesting_hospital_id"]).first()
    if not hospital:
        raise HTTPException(404, "Requesting hospital not found")
    
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    emergency_access = EmergencyAccess(
        user_id=current_user.id, requesting_hospital_id=hospital.id,
        requester_name=request["requester_name"], requester_cell=request["requester_cell"],
        reason=request["reason"], granted_at=None, expires_at=expires_at,
        status="pending", notified_patient=False
    )
    
    db.add(emergency_access)
    db.commit()
    db.refresh(emergency_access)
    
    log_audit(db=db, user_id=current_user.id, hospital_id=hospital.id,
        action_type="emergency_access_requested",
        action_description=f"Emergency access requested: {request['reason']}")
    
    return EmergencyAccessResponse(
        id=emergency_access.id, requesting_hospital_id=emergency_access.requesting_hospital_id,
        requesting_hospital_name=hospital.hospital_name,
        requester_name=emergency_access.requester_name,
        requester_cell=emergency_access.requester_cell,
        reason=emergency_access.reason, status=emergency_access.status,
        granted_at=None, expires_at=emergency_access.expires_at.isoformat(),
        notified_patient=False, verified_by=None, verified_at=None,
        created_at=emergency_access.created_at.isoformat()
    )

@router.get("/recent-requests", response_model=list[EmergencyAccessResponse])
async def get_recent_requests(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    requests = db.query(EmergencyAccess).filter(
        EmergencyAccess.user_id == current_user.id,
        EmergencyAccess.status.in_(['pending', 'granted'])
    ).order_by(EmergencyAccess.granted_at.desc()).limit(10).all()
    
    return [EmergencyAccessResponse(
        id=r.id, requesting_hospital_id=r.requesting_hospital_id,
        requesting_hospital_name=r.requesting_hospital.hospital_name if r.requesting_hospital else "Unknown",
        requester_name=r.requester_name, requester_cell=r.requester_cell,
        reason=r.reason, status=r.status, granted_at=r.granted_at,
        expires_at=r.expires_at.isoformat(), notified_patient=r.notified_patient,
        verified_by=r.verified_by, verified_at=r.verified_at,
        created_at=r.created_at.isoformat()
    ) for r in requests]

@router.post("/revoke", response_model=dict)
async def revoke_emergency_access(access_id: str,
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    emergency_access = db.query(EmergencyAccess).filter(
        EmergencyAccess.id == access_id, EmergencyAccess.user_id == current_user.id
    ).first()
    
    if not emergency_access:
        raise HTTPException(404, "Access request not found")
    
    emergency_access.status = "revoked"
    emergency_access.granted_at = None
    db.commit()
    
    log_audit(db=db, user_id=current_user.id,
        action_type="emergency_access_revoked",
        action_description="Patient revoked emergency access")
    
    return {"success": True, "message": "Emergency access revoked"}
