"""Patient visit model."""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from app.database import Base
import uuid

class PatientVisit(Base):
    __tablename__ = "patient_visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=False, index=True)
    visit_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    location = Column(String(255), nullable=True)
    doctor_name = Column(String(255), nullable=True)
    case_name = Column(String(255), nullable=True)
    visit_notes = Column(Text, nullable=True)
    is_emergency = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<PatientVisit(id={self.id}, case='{self.case_name}', hospital_id='{self.hospital_id}')>"
