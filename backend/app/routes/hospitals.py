"""Hospital routes for searching, connecting, and consent management."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.models.private_key import PrivateKey
from app.models.visit import PatientVisit
from app.models.consent import Consent
from app.schemas.hospitals import (
    HospitalSearchResponse, HospitalDetailsResponse,
    HospitalListResponse, ConnectResponse, ConsentRequest, ConsentResponse
)

router = APIRouter(prefix="/hospitals", tags=["hospitals"], dependencies=[Depends(get_current_active_user)])

@router.get("", response_model=HospitalListResponse)
async def list_hospitals(
    search: Optional[str] = None,
    city: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List and search hospitals with private key and visit history indicators."""
    query = db.query(Hospital).filter(Hospital.status == "active")
    if search:
        query = query.filter(
            (Hospital.hospital_name.ilike(f"%{search}%")) |
            (Hospital.hospital_id.ilike(f"%{search}%"))
        )
    if city:
        query = query.filter(Hospital.city.ilike(f"%{city}%"))

    total = query.count()
    hospitals_db = query.offset((page - 1) * page_size).limit(page_size).all()

    # Enrich with user-specific flags
    result = []
    for h in hospitals_db:
        has_key = db.query(PrivateKey).filter(
            PrivateKey.user_id == current_user.id,
            PrivateKey.hospital_id == h.id,
            PrivateKey.is_active == True
        ).first() is not None

        has_visit = db.query(PatientVisit).filter(
            PatientVisit.user_id == current_user.id,
            PatientVisit.hospital_id == h.id
        ).first() is not None

        result.append(HospitalSearchResponse(
            id=h.id,
            hospital_id=h.hospital_id,
            hospital_name=h.hospital_name,
            city=h.city,
            status=h.status,
            has_active_private_key=has_key,
            has_visit_history=has_visit
        ))

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return HospitalListResponse(
        hospitals=result,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{hospital_id}", response_model=HospitalDetailsResponse)
async def get_hospital(
    hospital_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get hospital details by external hospital_id or UUID."""
    hospital = db.query(Hospital).filter(
        (Hospital.hospital_id == hospital_id) | (Hospital.id == hospital_id)
    ).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    has_key = db.query(PrivateKey).filter(
        PrivateKey.user_id == current_user.id,
        PrivateKey.hospital_id == hospital.id,
        PrivateKey.is_active == True
    ).first() is not None

    has_visit = db.query(PatientVisit).filter(
        PatientVisit.user_id == current_user.id,
        PatientVisit.hospital_id == hospital.id
    ).first() is not None

    return HospitalDetailsResponse(
        id=hospital.id,
        hospital_id=hospital.hospital_id,
        hospital_name=hospital.hospital_name,
        city=hospital.city,
        address=hospital.address,
        email=hospital.email,
        phone=hospital.phone,
        status=hospital.status,
        has_active_private_key=has_key,
        has_visit_history=has_visit
    )

@router.post("/{hospital_id}/connect", response_model=ConnectResponse)
async def connect_hospital(
    hospital_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Initiate connection with a hospital."""
    hospital = db.query(Hospital).filter(
        (Hospital.hospital_id == hospital_id) | (Hospital.id == hospital_id)
    ).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    return ConnectResponse(
        message=f"Connection requested with {hospital.hospital_name}",
        hospital_id=hospital.hospital_id
    )

@router.post("/{hospital_id}/consent", response_model=ConsentResponse)
async def grant_consent(
    hospital_id: str,
    consent_data: ConsentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Grant time-limited, revocable record consent to a hospital."""
    hospital = db.query(Hospital).filter(
        (Hospital.hospital_id == hospital_id) | (Hospital.id == hospital_id)
    ).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Get active private key
    key = db.query(PrivateKey).filter(
        PrivateKey.user_id == current_user.id,
        PrivateKey.hospital_id == hospital.id,
        PrivateKey.is_active == True
    ).first()

    key_index = key.hospital_private_key_index if key else f"PK-{uuid.uuid4().hex[:12].upper()}"

    now = datetime.utcnow()
    expires = now + timedelta(days=consent_data.consent_duration_days)

    consent = Consent(
        user_id=current_user.id,
        sharing_type=consent_data.sharing_type,
        target_hospital_id=hospital.id,
        consent_duration_days=consent_data.consent_duration_days,
        requested_at=now,
        approved_at=now,
        expires_at=expires,
        status="approved",
        granted_scope=consent_data.record_scope,
        associated_hospital_private_key=key_index
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)

    return ConsentResponse(
        id=consent.id,
        sharing_type=consent.sharing_type,
        consent_duration_days=consent.consent_duration_days,
        record_scope=consent.granted_scope or {},
        status=consent.status,
        expires_at=consent.expires_at
    )

