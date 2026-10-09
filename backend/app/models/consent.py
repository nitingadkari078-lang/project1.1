"""Records consent model for sharing between hospitals."""

from datetime import datetime, timedelta
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON, ARRAY
from app.database import Base
import uuid

class Consent(Base):
    __tablename__ = "records_consent"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sharing_type = Column(String(50), nullable=False)  # read_only, read_write
    target_hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="SET NULL"), index=True)
    consent_duration_days = Column(Integer, nullable=False)  # 7, 30, 90, 365
    requested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="pending", nullable=False, index=True)  # pending, approved, rejected, expired
    granted_scope = Column(JSON, nullable=True, default=dict)  # Record categories to share
    associated_hospital_private_key = Column(String(255), nullable=False)  # The hospital's private key
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Consent(id={self.id}, status='{self.status}', hospital_id='{self.target_hospital_id}')>"
