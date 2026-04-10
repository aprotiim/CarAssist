# Cargenuity — AI-Powered Used Car Buying Assistant

Cargenuity helps you find, evaluate, and buy used cars with confidence. It searches 9+ major marketplaces simultaneously, scores every deal with AI, and gives you expert buying guidance — all in one place.

---

## Features

- **Smart Search** — searches Cars.com, CarGurus, Carvana, CarMax, Autotrader, TrueCar, Edmunds, Vroom, and Craigslist in parallel via the Exa web search API
- **AI Deal Scoring** — every listing is scored 0–100 using Claude based on price, mileage, and year
- **Step-by-Step Wizard** — guided search across budget, body type, fuel, year, mileage, transmission, drivetrain, brand, and location
- **AI Chat Assistant** — ask anything about the car buying process; powered by Claude with RAG knowledge base
- **Buying Guide** — curated expert content covering inspections, financing, negotiation, VIN checks, and more
- **Save Listings** — bookmark cars during your session for easy comparison
- **Auth System** — register/login with email and password; all routes protected by middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python), Uvicorn |
| AI | Anthropic Claude (claude-haiku for parsing, claude-sonnet for chat) |
| Web Search | Exa AI (`exa-py`) |
| Database | SQLite via SQLAlchemy |
| Auth | bcrypt password hashing, cookie-based sessions |

---

## Project Structure

```
MYRealProduct/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── landing/           # Public landing page
│   │   ├── login/             # Auth (register + sign in)
│   │   ├── wizard/            # Multi-step search wizard
│   │   ├── results/           # Search results + sort
│   │   ├── guide/             # Buying guide
│   │   ├── chat/              # AI chat assistant
│   │   └── api/               # Next.js API routes (proxy to backend)
│   ├── components/            # Nav, ListingCard, ToggleChip, etc.
│   ├── lib/                   # Types, constants, context
│   └── middleware.ts           # Auth guard
│
└── backend/                   # FastAPI app
    ├── main.py                # App entry point
    ├── routers/
    │   ├── auth.py            # Register / login / logout
    │   ├── search.py          # Car search endpoint
    │   ├── chat.py            # Streaming AI chat
    │   └── preferences.py     # User preferences
    ├── services/
    │   ├── exa_service.py     # Exa search + Claude parsing
    │   ├── claude_service.py  # Listing analysis
    │   └── rag_service.py     # RAG for buying guide
    ├── models/
    │   ├── schemas.py         # Pydantic models
    │   └── user_model.py      # SQLAlchemy user model
    ├── data/
    │   └── rag_content.py     # Buying guide knowledge base
    └── database.py            # SQLite setup
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys for [Anthropic](https://console.anthropic.com/) and [Exa](https://exa.ai/)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cargenuity.git
cd cargenuity
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Fill in your ANTHROPIC_API_KEY and EXA_API_KEY in .env
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

---

### Running locally

**Backend** (from project root):
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**Frontend** (from `frontend/` directory):
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the landing page. Register an account to get started.

---

## Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
EXA_API_KEY=...

# Optional
ALLOWED_ORIGINS=http://localhost:3000
DEBUG=true
```

---

## How It Works

1. **User fills out the search wizard** — budget, car type, fuel, year range, mileage, location
2. **Backend queries 9 domains in parallel** via Exa, fetching real page content from listing sites
3. **Claude parses the raw page text** into structured car listing objects (year, make, model, price, mileage, etc.)
4. **Each listing is scored** based on price, mileage, and year — ranked by best deal
5. **Results page** shows listings with sort options (best deal, price, mileage, newest)
6. **AI chat** uses a RAG knowledge base to answer buying questions in real time

---

## Screenshots

> Add screenshots of the landing page, wizard, and results page here.

---

## License

MIT
