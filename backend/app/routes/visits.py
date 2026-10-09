"""Patient visits and cases routes."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.models.visit import PatientVisit
from app.models.case import Case
from app.schemas.visits import (
    PatientVisitResponse, CaseDetailsResponse,
    CaseCreate
)

router = APIRouter(prefix="/hospitals", tags=["visits"], dependencies=[Depends(get_current_active_user)])

@router.get("/{hospital_id}/visits", response_model=list[PatientVisitResponse])
async def get_patient_visits(
    hospital_id: str,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all visit history for a specific hospital."""
    hospital = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    query = db.query(PatientVisit).filter(
        PatientVisit.user_id == current_user.id,
        PatientVisit.hospital_id == hospital.id
    ).order_by(PatientVisit.visit_date.desc())
    
    if search:
        query = query.filter(PatientVisit.case_name.ilike(f"%{search}%"))
    
    visits = query.all()
    result = []
    for visit in visits:
        cases = db.query(Case).filter(Case.visit_id == visit.id).all()
        result.append(PatientVisitResponse(
            id=visit.id, user_id=visit.user_id, hospital_id=visit.hospital_id,
            visit_date=visit.visit_date, location=visit.location,
            doctor_name=visit.doctor_name, case_name=visit.case_name,
            visit_notes=visit.visit_notes, is_emergency=visit.is_emergency,
            cases=[CaseDetailsResponse.model_validate(c) for c in cases]
        ))
    return result

@router.get("/{hospital_id}/visits/{visit_id}", response_model=PatientVisitResponse)
async def get_visit_detail(hospital_id: str, visit_id: str,
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    visit = db.query(PatientVisit).filter(PatientVisit.id == visit_id, PatientVisit.user_id == current_user.id).first()
    if not visit: raise HTTPException(404, "Visit not found")
    hospital = db.query(Hospital).filter(Hospital.id == visit.hospital_id).first()
    if not hospital: raise HTTPException(404, "Hospital not found")
    if hospital.hospital_id != hospital_id: raise HTTPException(403, "Access denied")
    cases = db.query(Case).filter(Case.visit_id == visit.id).all()
    return PatientVisitResponse(id=visit.id, user_id=visit.user_id, hospital_id=visit.hospital_id,
        visit_date=visit.visit_date, location=visit.location, doctor_name=visit.doctor_name,
        case_name=visit.case_name, visit_notes=visit.visit_notes, is_emergency=visit.is_emergency,
        cases=[CaseDetailsResponse.model_validate(c) for c in cases])

@router.get("/{hospital_id}/visits/{visit_id}/cases", response_model=list[CaseDetailsResponse])
async def get_visit_cases(hospital_id: str, visit_id: str,
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    visit = db.query(PatientVisit).filter(PatientVisit.id == visit_id, PatientVisit.user_id == current_user.id).first()
    if not visit: raise HTTPException(404, "Visit not found")
    hospital = db.query(Hospital).filter(Hospital.id == visit.hospital_id).first()
    if not hospital or hospital.hospital_id != hospital_id: raise HTTPException(403, "Access denied")
    cases = db.query(Case).filter(Case.visit_id == visit.id).all()
    return [CaseDetailsResponse.model_validate(c) for c in cases]

@router.get("/{hospital_id}/visits/{visit_id}/cases/{case_id}", response_model=CaseDetailsResponse)
async def get_case_detail(hospital_id: str, visit_id: str, case_id: str,
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id, Case.visit_id == visit_id).first()
    if not case: raise HTTPException(404, "Case not found")
    visit = db.query(PatientVisit).filter(PatientVisit.id == visit_id, PatientVisit.user_id == current_user.id).first()
    if not visit: raise HTTPException(404, "Visit not found")
    hospital = db.query(Hospital).filter(Hospital.id == visit.hospital_id).first()
    if not hospital or hospital.hospital_id != hospital_id: raise HTTPException(403, "Access denied")
    return CaseDetailsResponse(id=case.id, visit_id=case.visit_id, case_type=case.case_type,
        title=case.title, content=case.content, file_urls=case.file_urls or [], created_at=case.created_at,
        updated_at=case.updated_at)
