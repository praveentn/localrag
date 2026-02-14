import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.chat import ChatMessage, ChatSession
from app.schemas.chat import (
    ChatMessageCreate,
    ChatSessionCreate,
    ChatSessionDetailResponse,
    ChatSessionResponse,
)
from app.services.chat import handle_message

router = APIRouter()


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    data: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
):
    session = ChatSession(
        title=data.title,
        persona_id=data.persona_id,
        llm_provider=data.llm_provider,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ChatSession).order_by(ChatSession.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/sessions/{session_id}", response_model=ChatSessionDetailResponse)
async def get_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(
        ChatSession, session_id, options=[selectinload(ChatSession.messages)]
    )
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    await db.delete(session)
    await db.commit()
    return {"message": "Session deleted"}


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: uuid.UUID,
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    async def event_stream():
        async for token in handle_message(db, session_id, data.content):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
