import logging
import os
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.models.document import Chunk, Document, DocumentStatus
from app.services.embedding import embedding_service
from app.utils.chunking import chunk_text
from app.utils.text_extraction import extract_text

logger = logging.getLogger(__name__)


async def process_document(document_id: uuid.UUID):
    """Process a document: extract text, chunk, embed, and store."""
    async with async_session() as db:
        doc = await db.get(Document, document_id)
        if not doc:
            logger.error(f"Document {document_id} not found")
            return

        try:
            doc.status = DocumentStatus.PROCESSING
            await db.commit()

            filepath = os.path.join(settings.UPLOAD_DIR, str(doc.id), doc.filename)
            text = extract_text(filepath, doc.file_type)

            if not text.strip():
                doc.status = DocumentStatus.FAILED
                doc.error_message = "No text content extracted from file"
                await db.commit()
                return

            chunks = chunk_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
            embeddings = embedding_service.embed_batch(chunks)

            # Delete existing chunks (for reprocessing)
            existing = await db.execute(select(Chunk).where(Chunk.document_id == document_id))
            for chunk in existing.scalars().all():
                await db.delete(chunk)

            for i, (chunk_content, embedding) in enumerate(zip(chunks, embeddings)):
                chunk_obj = Chunk(
                    document_id=document_id,
                    chunk_index=i,
                    content=chunk_content,
                    token_count=len(chunk_content.split()),
                    embedding=embedding,
                )
                db.add(chunk_obj)

            doc.status = DocumentStatus.COMPLETED
            doc.chunk_count = len(chunks)
            doc.error_message = None
            await db.commit()
            logger.info(f"Document {document_id} processed: {len(chunks)} chunks")

        except Exception as e:
            logger.exception(f"Failed to process document {document_id}")
            doc.status = DocumentStatus.FAILED
            doc.error_message = str(e)
            await db.commit()
