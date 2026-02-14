from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PersonaCreate(BaseModel):
    name: str
    description: str | None = None
    system_prompt: str
    is_default: bool = False


class PersonaUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    system_prompt: str | None = None
    is_default: bool | None = None


class PersonaResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    system_prompt: str
    is_default: bool
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
