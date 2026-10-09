"""Emergency limited data model (quick access fields)."""

from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class EmergencyLimitedData(Base):
    __tablename__ = "emergency_limited_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    access_id = Column(UUID(as_uuid=True), ForeignKey("emergency_access.id", ondelete="CASCADE"), nullable=False)
    blood_group = Column(String(10), nullable=True)
    allergies = Column(JSON, nullable=True, default=list)  # List[str]; JSON for cross-DB support
    current_medications = Column(JSON, nullable=True, default=list)  # List[str]
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    organ_donor = Column(Boolean, default=False, nullable=False)
    height = Column(String(50), nullable=True)  # Example height in cm
    weight = Column(String(50), nullable=True)  # Example weight in kg
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<EmergencyLimitedData(user_id='{self.user_id}', blood_group='{self.blood_group}')>"
