"""Audit log Pydantic schemas."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any, Dict
import uuid

class AuditLogBase(BaseModel):
    action_type: str = Field(..., min_length=1, max_length=50)
    action_description: str = Field(..., min_length=1)
    user_id: Optional[uuid.UUID] = None
    hospital_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AuditLogResponse(AuditLogBase):
    id: uuid.UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AuditLogFilters(BaseModel):
    action_type: Optional[str] = Field(None, pattern=rf"^(login|public_kyc|private_key_{gest}|view_records|share_records|revoke_access|emergency_access_requests|emergency_access_granted|emergency_access_revoked|logout)$")
    hospital_id: Optional[uuid.UUID] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AuditLogPagination(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    action_type: Optional[str] = None
    hospital_id: Optional[uuid.UUID] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AuditLogListResponse(BaseModel):
    logs: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
