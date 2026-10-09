"""Hospital model."""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    hospital_id = Column(String(50), unique=True, nullable=False, index=True)  # External hospital ID
    hospital_name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=True)   # For "nearby hospitals" map
    longitude = Column(Float, nullable=True)
    status = Column(String(20), default="active", nullable=False)  # active, suspended, closed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Hospital(id={self.id}, name='{self.hospital_name}')>"
