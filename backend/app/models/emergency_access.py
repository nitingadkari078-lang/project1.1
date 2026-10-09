"""Emergency access model."""

from datetime import datetime, timedelta
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class EmergencyAccess(Base):
    __tablename__ = "emergency_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    requesting_hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="SET NULL"), index=True)
    requester_name = Column(String(255), nullable=False)
    requester_cell = Column(String(50), nullable=False)
    reason = Column(Text, nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), default="pending", nullable=False, index=True)  # pending, granted, revoked, expired
    notified_patient = Column(Boolean, default=False, nullable=False)
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<EmergencyAccess(id={self.id}, requester='{self.requester_name}', status='{self.status}')>"
