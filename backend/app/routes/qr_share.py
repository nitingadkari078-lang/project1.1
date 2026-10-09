"""Time-limited QR share routes (privacy feature).

A patient generates a QR code containing a short-lived signed token.
A hospital staff device scans the QR and receives read-only access
valid only until the token expires (max 5 minutes). Every generation,
scan, and expiry event is audit-logged. The QR itself is NOT a login
credential - it is a one-time, time-boxed consent token.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
import uuid as uuid_lib

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from sqlalchemy.orm import Session

from app.core.config import SECRET_KEY, ALGORITHM
from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.hospital import Hospital
from app.services.audit_service import log_audit

router = APIRouter(prefix="/qr-share", tags=["qr-share"])

QR_TOKEN_TYPE = "qr_share"
MIN_TTL_SECONDS = 15
MAX_TTL_SECONDS = 300  # Privacy: hard cap at 5 minutes


class QRGenerateRequest(BaseModel):
    hospital_id: str = Field(..., description="Target hospital (external hospital ID)")
    ttl_seconds: int = Field(60, ge=MIN_TTL_SECONDS, le=MAX_TTL_SECONDS,
                             description="Seconds until the QR expires automatically")


class QRGenerateResponse(BaseModel):
    token: str
    expires_in: int
    expires_at: str
    scope: str = "read_only"
    hospital_id: str


class QRScanRequest(BaseModel):
    token: str


class QRScanResponse(BaseModel):
    valid: bool
    scope: str = "read_only"
    remaining_seconds: int
    expires_at: str
    patient_name: str
    patient_age: Optional[int] = None
    hospital_name: str
    scanned_at: str


def _create_qr_token(user_id: str, hospital_ext_id: str, ttl_seconds: int) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(seconds=ttl_seconds)
    payload = {
        "typ": QR_TOKEN_TYPE,
        "sub": str(user_id),
        "hid": hospital_ext_id,
        "jti": secrets.token_hex(8),
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM), expires


@router.post("/generate", response_model=QRGenerateResponse)
async def generate_qr_token(
    request: QRGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate a short-lived, signed QR share token (patient side)."""
    ttl = min(max(request.ttl_seconds, MIN_TTL_SECONDS), MAX_TTL_SECONDS)

    hospital = db.query(Hospital).filter(
        Hospital.hospital_id == request.hospital_id
    ).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )

    token, expires = _create_qr_token(current_user.id, request.hospital_id, ttl)

    log_audit(
        db=db,
        user_id=current_user.id,
        hospital_id=hospital.id,
        action_type="qr_share_generated",
        action_description=f"Generated {ttl}s read-only QR share token for {hospital.hospital_name}",
        ip_address="127.0.0.1",
        metadata={"ttl_seconds": ttl, "scope": "read_only"},
    )
    db.commit()

    return QRGenerateResponse(
        token=token,
        expires_in=ttl,
        expires_at=expires.isoformat(),
        hospital_id=request.hospital_id,
    )


@router.post("/scan", response_model=QRScanResponse)
async def scan_qr_token(
    request: QRScanRequest,
    db: Session = Depends(get_db),
):
    """Validate a scanned QR token (hospital staff side) and return LIMITED read-only data."""
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        log_audit(
            db=db,
            action_type="qr_share_expired",
            action_description="Attempted to use an expired QR share token",
            ip_address="127.0.0.1",
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="QR token has expired - ask the patient to generate a new one",
        )
    except JWTError:
        log_audit(
            db=db,
            action_type="qr_share_scan_failed",
            action_description="Attempted to scan an invalid or tampered QR token",
            ip_address="127.0.0.1",
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or tampered QR token",
        )

    if payload.get("typ") != QR_TOKEN_TYPE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not a MediVault QR share token",
        )

    # jwt.decode already rejects expired tokens (ExpiredSignatureError -> JWTError),
    # but compute remaining seconds defensively.
    now_ts = int(datetime.now(timezone.utc).timestamp())
    remaining = int(payload.get("exp", 0)) - now_ts
    if remaining <= 0:
        log_audit(
            db=db,
            action_type="qr_share_expired",
            action_description="Attempted to use an expired QR share token",
            ip_address="127.0.0.1",
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="QR token has expired - ask the patient to generate a new one",
        )

    try:
        user_uuid = uuid_lib.UUID(str(payload.get("sub")))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subject in QR token",
        )
    user = db.query(User).filter(User.id == user_uuid).first()
    hospital = db.query(Hospital).filter(
        Hospital.hospital_id == payload.get("hid")
    ).first()
    if not user or not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient or hospital no longer exists",
        )

    log_audit(
        db=db,
        user_id=user.id,
        hospital_id=hospital.id,
        action_type="qr_share_scanned",
        action_description=f"QR token scanned; granted {remaining}s read-only view at {hospital.hospital_name}",
        ip_address="127.0.0.1",
        metadata={"remaining_seconds": remaining, "scope": "read_only"},
    )
    db.commit()

    expires_dt = datetime.fromtimestamp(int(payload.get("exp", 0)), tz=timezone.utc)
    return QRScanResponse(
        valid=True,
        remaining_seconds=remaining,
        expires_at=expires_dt.isoformat(),
        patient_name=getattr(user, "full_name", None) or getattr(user, "name", None) or "Patient",
        patient_age=getattr(user, "age", None),
        hospital_name=hospital.hospital_name,
        scanned_at=datetime.now(timezone.utc).isoformat(),
    )