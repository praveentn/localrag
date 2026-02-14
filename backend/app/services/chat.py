import logging
from typing import AsyncIterator
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import ChatMessage, ChatSession
from app.models.persona import Persona
from app.services.llm.factory import get_llm_provider
from app.services.search import vector_search

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_PROMPT = """You are a helpful knowledge assistant. Answer questions based on the provided context.
If the context doesn't contain relevant information, say so honestly.
Always cite which sources you're drawing from when possible."""

MAX_HISTORY_MESSAGES = 4
MAX_CONTEXT_CHUNKS = 1


async def handle_message(
    db: AsyncSession,
    session_id: UUID,
    user_content: str,
) -> AsyncIterator[str]:
    """Handle a user message: RAG search, context assembly, LLM streaming."""
    session = await db.get(
        ChatSession, session_id, options=[selectinload(ChatSession.persona)]
    )
    if not session:
        raise ValueError(f"Session {session_id} not found")

    # Save user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=user_content,
    )
    db.add(user_msg)
    await db.commit()

    # RAG: search for relevant chunks
    search_results = await vector_search(db, user_content, top_k=MAX_CONTEXT_CHUNKS)

    # Build context from search results
    context_parts = []
    context_chunk_ids = []
    for result in search_results:
        context_parts.append(
            f"--- Source: {result['filename']}, Chunk {result['chunk_index']} (score: {result['score']}) ---\n{result['content']}"
        )
        context_chunk_ids.append(str(result["chunk_id"]))

    context_text = "\n\n".join(context_parts)

    # Get system prompt
    system_prompt = DEFAULT_SYSTEM_PROMPT
    if session.persona and session.persona.system_prompt:
        system_prompt = session.persona.system_prompt

    # Build messages for LLM
    messages = [{"role": "system", "content": system_prompt}]

    if context_text:
        messages.append({
            "role": "system",
            "content": f"Here is relevant context from the knowledge base:\n\n{context_text}",
        })

    # Add recent chat history
    history_stmt = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES + 1)  # +1 for the current user message
    )
    history_result = await db.execute(history_stmt)
    history_messages = list(reversed(history_result.scalars().all()))

    for msg in history_messages:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    # Stream LLM response
    provider = get_llm_provider(session.llm_provider)
    full_response = []

    async for token in provider.generate_stream(messages):
        full_response.append(token)
        yield token

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content="".join(full_response),
        context_chunks=context_chunk_ids if context_chunk_ids else None,
    )
    db.add(assistant_msg)

    # Update session title from first message
    if len(history_messages) <= 1:
        session.title = user_content[:100]

    await db.commit()
