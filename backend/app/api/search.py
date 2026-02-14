from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.search import SearchRequest, SearchResponse
from app.services.search import vector_search

router = APIRouter()


@router.post("", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
):
    results = await vector_search(db, request.query, request.top_k, request.threshold)
    return SearchResponse(
        query=request.query,
        results=results,
        total=len(results),
    )
