from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChatSessionCreate(BaseModel):
    title: str = "New Chat"
    persona_id: UUID | None = None
    llm_provider: str = "ollama"


class ChatSessionResponse(BaseModel):
    id: UUID
    title: str
    persona_id: UUID | None = None
    llm_provider: str
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    context_chunks: list | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionDetailResponse(ChatSessionResponse):
    messages: list[ChatMessageResponse] = []
