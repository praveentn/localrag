from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Chunk, Document
from app.services.embedding import embedding_service


async def vector_search(
    db: AsyncSession,
    query: str,
    top_k: int = 5,
    threshold: float = 0.3,
) -> list[dict]:
    """Perform vector similarity search on chunks."""
    query_embedding = embedding_service.embed_single(query)

    # Cosine distance: lower is more similar. Score = 1 - distance.
    stmt = (
        select(
            Chunk.id,
            Chunk.document_id,
            Chunk.chunk_index,
            Chunk.content,
            Document.filename,
            (1 - Chunk.embedding.cosine_distance(query_embedding)).label("score"),
        )
        .join(Document, Chunk.document_id == Document.id)
        .where(
            (1 - Chunk.embedding.cosine_distance(query_embedding)) >= threshold
        )
        .order_by(
            Chunk.embedding.cosine_distance(query_embedding)
        )
        .limit(top_k)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "chunk_id": row.id,
            "document_id": row.document_id,
            "chunk_index": row.chunk_index,
            "content": row.content,
            "filename": row.filename,
            "score": round(float(row.score), 4),
        }
        for row in rows
    ]
