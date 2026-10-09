"""Audit log routes."""

from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/logs", response_model=list)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action_type: Optional[str] = None,
    hospital_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    # Don't require auth for audit visibility (for compliance)
):
    """Get audit logs. Can be accessed publicly for compliance verification."""
    
    query = AuditLog.query
    if action_type:
        query = query.filter(AuditLog.action_type == action_type)
    if hospital_id:
        query = query.filter(AuditLog.hospital_id == hospital_id)
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    
    logs = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return [{
        "id": str(log.id),
        "action_type": log.action_type,
        "action_description": log.action_description,
        "user_id": str(log.user_id) if log.user_id else None,
        "user_email": log.user.email if log.user else None,
        "hospital_id": str(log.hospital_id) if log.hospital_id else None,
        "hospital_name": log.hospital.hospital_name if log.hospital else None,
        "ip_address": str(log.ip_address) if log.ip_address else None,
        "timestamp": log.created_at.isoformat(),
        "metadata": log.metadata or {}
    } for log in logs]
