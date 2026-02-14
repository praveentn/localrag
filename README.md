# LocalRAG

A knowledge management web application with RAG (Retrieval-Augmented Generation) capabilities for ingesting documents, searching content, and chatting with your knowledge base.

## Features

- **Data Management**: Upload and ingest .txt and .pdf files with automatic chunking and embedding
- **Search**: Vector similarity search with score ranking
- **Chat**: Conversational AI with RAG context retrieval, multiple personas
- **Admin**: Manage settings, database queries, system prompts, and personas

## Tech Stack

- **Backend**: FastAPI, PostgreSQL + pgVector, SQLAlchemy (async)
- **Frontend**: React + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **LLM**: Ollama (local) and Azure OpenAI

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose

## Quick Start

### 1. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (with pgVector) and Ollama.

### 2. Pull an Ollama Model

```bash
docker exec localrag-ollama ollama pull llama3.2
```

### 3. Start Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at http://localhost:5173.

## Configuration

Copy `.env.example` to `backend/.env` and adjust values as needed. Key settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://localrag:localrag@localhost:5432/localrag` | Database connection |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Default Ollama model |
| `CHUNK_SIZE` | `512` | Words per chunk |
| `CHUNK_OVERLAP` | `50` | Overlap words between chunks |
| `DEFAULT_TOP_K` | `5` | Default search results count |

## Project Structure

```
localrag/
├── docker-compose.yml          # PostgreSQL + Ollama
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app
│   │   ├── config.py           # Settings
│   │   ├── database.py         # DB engine
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── api/                # Route handlers
│   │   ├── services/           # Business logic + LLM providers
│   │   └── utils/              # Text extraction, chunking
│   └── alembic/                # DB migrations
└── frontend/
    └── src/
        ├── pages/              # Page components
        ├── components/         # UI components
        ├── hooks/              # React Query hooks
        ├── lib/                # API client, utilities
        └── types/              # TypeScript types
```
