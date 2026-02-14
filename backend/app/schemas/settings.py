from datetime import datetime

from pydantic import BaseModel


class SettingUpdate(BaseModel):
    value: str


class SettingResponse(BaseModel):
    key: str
    value: str
    description: str | None = None
    category: str
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class DbQueryRequest(BaseModel):
    sql: str


class DbQueryResponse(BaseModel):
    columns: list[str]
    rows: list[list]
    row_count: int
