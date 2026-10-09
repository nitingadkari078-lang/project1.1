"""Case model (lab reports, prescriptions, etc)."""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visit_id = Column(UUID(as_uuid=True), ForeignKey("patient_visits.id", ondelete="CASCADE"), nullable=False)
    case_type = Column(String(50), nullable=False)  # lab_report, discharge_summary, prescription, notes, imaging_report, other
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    file_urls = Column(JSON, nullable=True, default=list)  # Array of file URLs
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Case(id={self.id}, type='{self.case_type}', title='{self.title}')>"
