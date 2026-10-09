"""Private Key Pydantic schemas."""

import uuid
from typing import Optional

from pydantic import BaseModel


class PrivateKeySchema(BaseModel):
    """A patient's private key for a specific hospital."""

    id: uuid.UUID
    hospital_id: str
    hospital_name: str
    key_index: str
    age: int
    generated_at: str
    expires_at: Optional[str] = None
    is_active: bool