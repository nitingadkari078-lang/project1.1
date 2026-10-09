"""Audit service for logging all security events."""

from typing import Optional

from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.hospital import Hospital
from app.models.audit_log import AuditLog

def log_audit(
    db: Session,
    user_id: Optional[str] = None,
    action_type: str = "",
    action_description: str = "",
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    hospital_id: Optional[str] = None,
    metadata: Optional[dict] = None
):
    """
    Log an audit event.
    Every action must be logged for security compliance.
    """
    audit = AuditLog(
        user_id=user_id,
        hospital_id=hospital_id,
        action_type=action_type,
        action_description=action_description,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata=metadata or {}
    )
    db.add(audit)
    
    # Flush to get ID without committing
    try:
        db.flush()
    except Exception:
        # If fail, just add to batch
        pass
    return audit
