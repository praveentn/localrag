from fastapi import APIRouter

from app.api.documents import router as documents_router
from app.api.search import router as search_router
from app.api.chat import router as chat_router
from app.api.admin import router as admin_router

api_router = APIRouter(prefix="/api")
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(search_router, prefix="/search", tags=["search"])
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
