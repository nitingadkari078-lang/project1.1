"""Emergency access routes (read-only - for emergency scenarios)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.models.emergency_access import EmergencyAccess
from app.models.emergency_data import EmergencyLimitedData
from app.schemas.emergency import EmergencyDataResponse

# Separate router for emergency scenarios without full auth
em_router = APIRouter(prefix="/emergency", tags=["emergency-read-only"])

@em_router.get("/access", response_model=Optional[EmergencyDataResponse])
async def get_emergency_data(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get emergency limited data (returns None if no active access)."""
    emergency_access = db.query(EmergencyAccess).filter(
        EmergencyAccess.user_id == current_user.id,
        EmergencyAccess.status == "granted",
        EmergencyAccess.expires_at > datetime.utcnow()
    ).order_by(EmergencyAccess.granted_at.desc()).first()
    
    if emergency_access:
        emergency_data = db.query(EmergencyLimitedData).filter(
            EmergencyLimitedData.user_id == current_user.id,
            EmergencyLimitedData.access_id == emergency_access.id
        ).first()
        
        if emergency_data:
            return EmergencyDataResponse(
                blood_group=emergency_data.blood_group,
                allergies=emergency_data.allergies or [],
                current_medications=emergency_data.current_medications or [],
                emergency_contact_name=emergency_data.emergency_contact_name,
                emergency_contact_phone=emergency_data.emergency_contact_phone,
                organ_donor=emergency_data.organ_donor
            )
    
    return None

@em_router.get("/contacts")
async def get_emergency_contacts(hospital_id: str, db: Session = Depends(get_db)):
    """Get emergency contacts list for a hospital."""
    hospital = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hospital:
        return []
    
    # Mock contacts - in production would fetch from database
    return [
        {"id": "1", "hospital_id": hospital.id, "hospital_name": hospital.hospital_name,
         "doctor_name": "Dr. John Smith", "contact_number": "+1-555-0100",
         "email": "john.smith@hospital.com", "verified": True},
        {"id": "2", "hospital_id": hospital.id, "hospital_name": hospital.hospital_name,
         "doctor_name": "Dr. Sarah Johnson", "contact_number": "+1-555-0101",
         "email": "sarah.j@hospital.com", "verified": True}
    ]

@em_router.get("/recent-hospitals", response_model=list)
async def get_last_hospitals(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get hospitals patient has visited recently."""
    from app.models.patient_visit import PatientVisit
    
    visits = db.query(PatientVisit).filter(
        PatientVisit.user_id == current_user.id
    ).order_by(PatientVisit.visit_date.desc()).limit(10).all()
    
    hospital_ids = list({v.hospital_id for v in visits})
    hospitals = db.query(Hospital).filter(Hospital.id.in_(hospital_ids)).all()
    
    return [
        {"hospital_id": h.hospital_id, "hospital_name": h.hospital_name,
         "city": h.city, "last_visit_date": next(v.visit_date for v in visits if v.hospital_id == h.id).isoformat()}
        for h in hospitals
    ]
