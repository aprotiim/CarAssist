# AutoSage — MVP Setup Guide

## Prerequisites
- Node.js 18+
- Python 3.11+
- Anthropic API key (get one at console.anthropic.com)

---

## Quick Start

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
# → http://localhost:3000
```

The frontend is fully self-contained — it uses Next.js API routes that call Claude directly with Vercel AI SDK streaming. The FastAPI backend is optional.

### 2. Backend (FastAPI + LangGraph)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # add ANTHROPIC_API_KEY
uvicorn backend.main:app --reload --port 8000
# → http://localhost:8000/docs
```

---

## Architecture

```
User
 │
 ├── Frontend (Next.js 14)
 │    ├── /wizard          → preference collection wizard (10 steps)
 │    ├── /results         → filtered + AI-scored listings
 │    ├── /guide           → 12-topic buying guide
 │    ├── /chat            → streaming AI chat (useChat hook)
 │    │
 │    └── API Routes
 │         ├── POST /api/chat    → streamText via @ai-sdk/anthropic
 │         └── POST /api/search  → mock listing filter
 │
 └── Backend (FastAPI + LangGraph)
      │
      └── POST /api/chat → LangGraph multi-agent graph
           │
           ├── router_node      (claude-haiku-4-5)
           │    └── classifies intent + extracts preferences
           │
           ├── search_node      (pure Python)
           │    └── filters MOCK_LISTINGS by prefs
           │
           ├── rag_node         (pure Python)
           │    └── keyword retrieval from 12-topic knowledge base
           │
           ├── analysis_node    (claude-sonnet-4-6)
           │    └── deep-dives a single listing
           │
           └── synthesis_node   (claude-sonnet-4-6)
                └── assembles context + generates final response
```

### LangGraph Flow

```
START → router → [search | rag | analysis | (general)→synthesizer]
                         ↓         ↓           ↓
                     synthesizer ──────────────┘
                         ↓
                        END
```

---

## Project Structure

```
MYRealProduct/
├── SETUP.md
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              root layout, PreferencesProvider, Nav
│   │   ├── page.tsx                home page
│   │   ├── wizard/page.tsx         10-step preference wizard
│   │   ├── results/page.tsx        car listing results + sort
│   │   ├── guide/page.tsx          12-topic buying guide
│   │   ├── chat/page.tsx           AI chat (useChat streaming)
│   │   └── api/
│   │       ├── chat/route.ts       streaming Claude via @ai-sdk/anthropic
│   │       └── search/route.ts     mock listing search
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── ScoreBar.tsx
│   │   ├── ToggleChip.tsx
│   │   ├── StepProgress.tsx
│   │   └── ListingCard.tsx
│   └── lib/
│       ├── types.ts
│       ├── constants.ts            all data: listings, RAG content, options
│       └── preferences-context.tsx global state (React Context)
│
└── backend/
    ├── main.py                     FastAPI app + CORS
    ├── agents/
    │   ├── state.py                AutoSageState TypedDict
    │   ├── nodes.py                5 async node functions
    │   └── graph.py                LangGraph StateGraph + autosage_graph singleton
    ├── routers/
    │   ├── chat.py                 POST /api/chat, GET /api/chat/stream (SSE)
    │   ├── search.py               POST /api/search, GET /api/listings/:id, POST analyze
    │   └── preferences.py          POST/GET /api/preferences
    ├── services/
    │   ├── claude_service.py       Anthropic SDK wrapper
    │   └── rag_service.py          keyword-based RAG retrieval
    ├── models/schemas.py           Pydantic request/response models
    └── data/
        ├── mock_listings.py        8 sample listings
        └── rag_content.py          12 buying guide topics + system prompt
```

---

## Backend API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Multi-agent graph (full response) |
| GET | `/api/chat/stream` | SSE streaming (`?q=your+question`) |
| POST | `/api/search` | Filter listings by preferences |
| GET | `/api/listings/:id` | Single listing detail |
| POST | `/api/listings/:id/analyze` | Claude AI analysis of a listing |
| POST | `/api/preferences` | Save search preferences |
| GET | `/api/preferences/:id` | Get saved preferences |

Interactive docs: http://localhost:8000/docs

---

## Environment Variables

**frontend/.env.local**
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=http://localhost:8000   # optional
```

**backend/.env**
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@localhost:5432/autosage
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000
```
