"""Patient visits and cases Pydantic schemas."""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
import uuid

class CaseType(str, Enum):
    LAB_REPORT = "lab_report"
    DISCHARGE_SUMMARY = "discharge_summary"
    PRESCRIPTION = "prescription"
    NOTES = "notes"
    IMAGING_REPORT = "imaging_report"
    OTHER = "other"

class CaseBase(BaseModel):
    case_type: CaseType
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    file_urls: Optional[List[str]] = []

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: uuid.UUID
    visit_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CaseSummary(CaseResponse):
    # Include only summary-level info
    pass

class PatientVisitBase(BaseModel):
    hospital_id: uuid.UUID
    location: Optional[str] = None
    doctor_name: Optional[str] = Field(None, min_length=1, max_length=255)
    case_name: Optional[str] = Field(None, min_length=1, max_length=255)
    visit_notes: Optional[str] = None
    is_emergency: bool = False

class PatientVisitCreate(PatientVisitBase):
    pass

class PatientVisitUpdate(BaseModel):
    location: Optional[str] = None
    doctor_name: Optional[str] = Field(None, min_length=1, max_length=255)
    case_name: Optional[str] = Field(None, min_length=1, max_length=255)
    visit_notes: Optional[str] = None
    is_emergency: bool = False

class PatientVisitResponse(PatientVisitBase):
    id: uuid.UUID
    user_id: uuid.UUID
    visit_date: datetime
    cases: List[CaseResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class CaseDetailsResponse(BaseModel):
    id: uuid.UUID
    visit_id: uuid.UUID
    case_type: CaseType
    title: str
    content: str
    file_urls: List[str]
    created_at: datetime
    updated_at: datetime

class VisitHistoryResponse(BaseModel):
    visits: List[PatientVisitResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
