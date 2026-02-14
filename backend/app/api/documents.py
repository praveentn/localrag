import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentDetailResponse, DocumentResponse
from app.services.document_processor import process_document

router = APIRouter()


@router.post("/upload", response_model=list[DocumentResponse])
async def upload_documents(
    files: list[UploadFile],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    uploaded = []
    for file in files:
        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
        if ext not in ("txt", "pdf"):
            raise HTTPException(400, f"Unsupported file type: {ext}. Only .txt and .pdf are supported.")

        doc = Document(
            filename=file.filename or "unnamed",
            file_type=ext,
            file_size=file.size,
            status=DocumentStatus.PENDING,
        )
        db.add(doc)
        await db.flush()

        doc_dir = os.path.join(settings.UPLOAD_DIR, str(doc.id))
        os.makedirs(doc_dir, exist_ok=True)
        filepath = os.path.join(doc_dir, doc.filename)

        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)

        uploaded.append(doc)
        background_tasks.add_task(process_document, doc.id)

    await db.commit()
    for doc in uploaded:
        await db.refresh(doc)
    return uploaded


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Document).order_by(Document.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(Document, document_id, options=[selectinload(Document.chunks)])
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    # Delete file from disk
    doc_dir = os.path.join(settings.UPLOAD_DIR, str(doc.id))
    if os.path.exists(doc_dir):
        import shutil
        shutil.rmtree(doc_dir)

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted"}


@router.post("/{document_id}/reprocess", response_model=DocumentResponse)
async def reprocess_document(
    document_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    doc.status = DocumentStatus.PENDING
    await db.commit()
    await db.refresh(doc)

    background_tasks.add_task(process_document, doc.id)
    return doc
