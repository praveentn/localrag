from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.document import DocumentStatus


class ChunkResponse(BaseModel):
    id: UUID
    chunk_index: int
    content: str
    token_count: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    file_type: str
    file_size: int | None = None
    status: DocumentStatus
    chunk_count: int
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class DocumentDetailResponse(DocumentResponse):
    chunks: list[ChunkResponse] = []
