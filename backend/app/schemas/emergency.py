"""Emergency access Pydantic schemas."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid

class EmergencyAccessRequest(BaseModel):
    requesting_hospital_id: uuid.UUID
    requesting_hospital_name: str
    requester_name: str = Field(..., min_length=1, max_length=255)
    requester_cell: str = Field(..., min_length=7, max_length=20, pattern=r'^[\d\s\-\+\(\)]+$')
    reason: str = Field(..., min_length=5)

class EmergencyAccessResponse(EmergencyAccessRequest):
    id: uuid.UUID
    status: str = Field(..., pattern="^(pending|granted|revoked|expired)$")
    granted_at: Optional[datetime] = None
    expires_at: datetime
    notified_patient: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class EmergencyDataResponse(BaseModel):
    blood_group: Optional[str] = None
    allergies: list[str] = []
    current_medications: list[str] = []
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    organ_donor: bool = False

class EmergencyContact(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    hospital_name: str
    doctor_name: str = Field(..., min_length=1, max_length=255)
    contact_number: str = Field(..., min_length=7, max_length=20)
    email: Optional[str] = Field(None, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    verified: bool = False
