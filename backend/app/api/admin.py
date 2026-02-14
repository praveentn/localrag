import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.persona import Persona
from app.models.settings import SystemSetting
from app.schemas.persona import PersonaCreate, PersonaResponse, PersonaUpdate
from app.schemas.settings import (
    DbQueryRequest,
    DbQueryResponse,
    SettingResponse,
    SettingUpdate,
)

router = APIRouter()


# --- Settings ---

@router.get("/settings", response_model=list[SettingResponse])
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemSetting).order_by(SystemSetting.category, SystemSetting.key))
    return result.scalars().all()


@router.put("/settings/{key}", response_model=SettingResponse)
async def update_setting(key: str, data: SettingUpdate, db: AsyncSession = Depends(get_db)):
    setting = await db.get(SystemSetting, key)
    if not setting:
        raise HTTPException(404, "Setting not found")
    setting.value = data.value
    await db.commit()
    await db.refresh(setting)
    return setting


# --- DB Queries ---

@router.post("/db/query", response_model=DbQueryResponse)
async def execute_query(data: DbQueryRequest, db: AsyncSession = Depends(get_db)):
    sql = data.sql.strip()

    # Block write operations
    forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE", "GRANT", "REVOKE"]
    first_word = sql.split()[0].upper() if sql.split() else ""
    if first_word in forbidden:
        raise HTTPException(400, "Only SELECT queries are allowed")

    try:
        result = await db.execute(text("SET TRANSACTION READ ONLY"))
        result = await db.execute(text(sql))
        rows = result.fetchall()
        columns = list(result.keys()) if rows else []
        return DbQueryResponse(
            columns=columns,
            rows=[list(row) for row in rows],
            row_count=len(rows),
        )
    except Exception as e:
        raise HTTPException(400, f"Query error: {str(e)}")


# --- Personas ---

@router.get("/personas", response_model=list[PersonaResponse])
async def list_personas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Persona).order_by(Persona.name))
    return result.scalars().all()


@router.post("/personas", response_model=PersonaResponse)
async def create_persona(data: PersonaCreate, db: AsyncSession = Depends(get_db)):
    if data.is_default:
        # Unset other defaults
        stmt = select(Persona).where(Persona.is_default == True)
        result = await db.execute(stmt)
        for p in result.scalars().all():
            p.is_default = False

    persona = Persona(**data.model_dump())
    db.add(persona)
    await db.commit()
    await db.refresh(persona)
    return persona


@router.put("/personas/{persona_id}", response_model=PersonaResponse)
async def update_persona(
    persona_id: uuid.UUID,
    data: PersonaUpdate,
    db: AsyncSession = Depends(get_db),
):
    persona = await db.get(Persona, persona_id)
    if not persona:
        raise HTTPException(404, "Persona not found")

    update_data = data.model_dump(exclude_unset=True)

    if update_data.get("is_default"):
        stmt = select(Persona).where(Persona.is_default == True, Persona.id != persona_id)
        result = await db.execute(stmt)
        for p in result.scalars().all():
            p.is_default = False

    for key, value in update_data.items():
        setattr(persona, key, value)

    await db.commit()
    await db.refresh(persona)
    return persona


@router.delete("/personas/{persona_id}")
async def delete_persona(
    persona_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    persona = await db.get(Persona, persona_id)
    if not persona:
        raise HTTPException(404, "Persona not found")
    await db.delete(persona)
    await db.commit()
    return {"message": "Persona deleted"}


# --- Health ---

@router.get("/health")
async def admin_health(db: AsyncSession = Depends(get_db)):
    checks = {}

    # DB check
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception:
        checks["database"] = "unhealthy"

    # Ollama check
    try:
        from app.services.llm.ollama import OllamaProvider
        provider = OllamaProvider()
        checks["ollama"] = "healthy" if await provider.health_check() else "unhealthy"
    except Exception:
        checks["ollama"] = "unhealthy"

    # Embedding model check
    try:
        from app.services.embedding import embedding_service
        _ = embedding_service.model
        checks["embedding_model"] = "healthy"
    except Exception:
        checks["embedding_model"] = "unhealthy"

    return checks
