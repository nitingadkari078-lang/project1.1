"""Hospital Pydantic schemas."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid

class HospitalBase(BaseModel):
    hospital_id: str = Field(..., description="External hospital ID")
    hospital_name: str = Field(..., min_length=1, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r'^[\d\s\-\+\(\)]+$')
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: str = Field("active", pattern="^(active|suspended|closed)$")

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    id: uuid.UUID
    has_active_private_key: bool = False
    has_visit_history: bool = False
    
    model_config = ConfigDict(from_attributes=True)

class HospitalSearchResponse(BaseModel):
    id: uuid.UUID
    hospital_id: str
    hospital_name: str
    city: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    has_active_private_key: bool
    has_visit_history: bool

class HospitalDetailsResponse(HospitalResponse):
    address: Optional[str]
    email: Optional[str]
    phone: Optional[str]

class ConnectRequest(BaseModel):
    pass

class ConnectResponse(BaseModel):
    message: str = "Connection request sent to hospital"
    hospital_id: str

class ConsentRequest(BaseModel):
    sharing_type: str = Field(..., pattern="^(read_only|read_write)$")
    consent_duration_days: int = Field(..., ge=7, le=365)
    record_scope: dict = Field(default_factory=dict, description="Record categories to share")

class ConsentResponse(ConsentRequest):
    id: uuid.UUID
    status: str = "pending"
    expires_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class HospitalListResponse(BaseModel):
    hospitals: List[HospitalSearchResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
