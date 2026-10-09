"""Private Key model for per-hospital authentication."""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSON
from app.database import Base
import uuid

class PrivateKey(Base):
    __tablename__ = "private_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=False, index=True)
    hospital_private_key_index = Column(String(255), nullable=False)  # The key to be saved in password managers
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    last_rotation_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        UniqueConstraint("user_id", "hospital_id", name="unique_user_hospital_key"),
    )

    def __repr__(self):
        return f"<PrivateKey(id={self.id}, hospital_id='{self.hospital_private_key_index}', user_id='{self.user_id}')>"
