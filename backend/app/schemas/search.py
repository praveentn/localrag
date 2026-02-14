from uuid import UUID

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=50)
    threshold: float = Field(default=0.3, ge=0.0, le=1.0)


class SearchResultItem(BaseModel):
    chunk_id: UUID
    document_id: UUID
    filename: str
    chunk_index: int
    content: str
    score: float

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    total: int
