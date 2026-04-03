# AutoSage — AI-Powered Used Car Buying Assistant

## Project Overview

**AutoSage** is an AI-powered web application that helps first-time and new used car buyers in the USA make informed purchasing decisions. It combines intelligent car search across major marketplaces with a RAG-powered knowledge base of used car buying best practices.

---

## Core Features

### 1. Smart Preference Collector
Conversational UI that gathers:
- **Budget** — min/max price range
- **Body type** — Sedan, SUV, Hatchback, Truck, Coupe, Convertible, Minivan
- **Fuel type** — Gasoline, Diesel, Hybrid, Plug-in Hybrid, Electric
- **Mileage tolerance** — max acceptable odometer reading
- **Model year range** — e.g. 2018–2023
- **Transmission** — Automatic, Manual, CVT
- **Drivetrain** — FWD, RWD, AWD, 4WD
- **Must-have features** — Backup camera, sunroof, leather seats, Apple CarPlay, heated seats, etc.
- **Color preference** (optional)
- **Location / zip code** — for proximity-based search
- **Dealer vs. private seller** preference
- **Brand preference** (optional) — e.g. Toyota, Honda, etc.

### 2. AI-Curated Car Listings (Aggregator)
Searches and aggregates listings from:
- **Autotrader** (autotrader.com)
- **Cars.com**
- **CarGurus** (cargurus.com)
- **Facebook Marketplace** (via scraping/API)
- **Craigslist** (via scraping)
- **CarMax** (carmax.com)
- **Carvana** (carvana.com)
- **TrueCar** (truecar.com)

Each result shows: price, mileage, year, make/model, dealer/private, photos, link, and an **AI deal score** (good/fair/overpriced based on KBB/Edmunds data).

### 3. RAG-Powered Buying Guide (Knowledge Assistant)
A chatbot that answers questions using a curated knowledge base covering:
- Pre-purchase inspection checklist
- How to read a vehicle history report (Carfax/AutoCheck)
- Red flags in used car listings
- Negotiation tactics and scripts
- Financing options (dealer vs. bank vs. credit union)
- Title types (clean, salvage, rebuilt, lemon)
- State-specific regulations (emissions, registration, lemon laws)
- Insurance considerations
- Warranty options (CPO, extended, as-is)
- Common scams and how to avoid them
- Test drive checklist
- Post-purchase steps (registration, insurance, maintenance)

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                │
│  ┌───────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ Preference │  │  Listings  │  │  RAG Chat     │  │
│  │ Wizard     │  │  Gallery   │  │  Interface    │  │
│  └─────┬─────┘  └─────┬──────┘  └──────┬────────┘  │
└────────┼──────────────┼────────────────┼────────────┘
         │              │                │
         ▼              ▼                ▼
┌─────────────────────────────────────────────────────┐
│                BACKEND (FastAPI / Node.js)           │
│  ┌───────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ Preference │  │  Scraper / │  │  RAG Engine   │  │
│  │ Engine     │  │  Aggregator│  │  (LangChain)  │  │
│  └─────┬─────┘  └─────┬──────┘  └──────┬────────┘  │
│        │              │                │             │
│        ▼              ▼                ▼             │
│  ┌──────────┐  ┌────────────┐  ┌───────────────┐   │
│  │ Claude   │  │ Marketplace│  │  Vector DB    │   │
│  │ API      │  │ APIs/Scrape│  │  (Pinecone /  │   │
│  │          │  │            │  │   ChromaDB)   │   │
│  └──────────┘  └────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────┘
         │              │                │
         ▼              ▼                ▼
┌─────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + Redis)           │
│  Users · Saved searches · Cached listings · Sessions│
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer         | Technology                                      |
|---------------|--------------------------------------------------|
| Frontend      | Next.js 14+ (App Router), Tailwind CSS, Framer Motion |
| Backend API   | FastAPI (Python) or Express.js (Node)            |
| AI/LLM        | Claude API (Anthropic) for chat + analysis       |
| RAG Framework | LangChain + ChromaDB (local) or Pinecone (cloud) |
| Embeddings    | Voyage AI or OpenAI text-embedding-3-small       |
| Scraping      | Playwright / Puppeteer + rotating proxies        |
| Database      | PostgreSQL (users, searches) + Redis (cache)     |
| Auth          | NextAuth.js or Clerk                             |
| Deployment    | Vercel (frontend) + Railway/Fly.io (backend)     |
| Monitoring    | Sentry + PostHog analytics                       |

---

## Development Phases

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Set up Next.js project with Tailwind + component library
- [ ] Build the preference collection wizard (multi-step form)
- [ ] Set up FastAPI backend with basic endpoints
- [ ] Integrate Claude API for conversational preference refinement
- [ ] Design and implement the database schema
- [ ] Basic auth (email + password)

### Phase 2 — Aggregation Engine (Weeks 4–6)
- [ ] Build scrapers for 3 primary sources (CarGurus, Cars.com, Autotrader)
- [ ] Normalize listing data into a unified schema
- [ ] Implement search/filter/sort API endpoints
- [ ] Build the listings gallery UI with filters
- [ ] Add AI deal scoring (compare price vs. market value)
- [ ] Implement Redis caching for listing results

### Phase 3 — RAG Knowledge Base (Weeks 7–9)
- [ ] Curate and write the used car buying guide content (20+ documents)
- [ ] Chunk documents and generate embeddings
- [ ] Set up ChromaDB vector store
- [ ] Build RAG pipeline with LangChain + Claude
- [ ] Create the chat interface with source citations
- [ ] Add contextual help (surface relevant guides based on user's stage)

### Phase 4 — Intelligence Layer (Weeks 10–11)
- [ ] AI-generated vehicle comparison reports
- [ ] Price trend analysis per make/model/year
- [ ] Personalized recommendations based on browsing history
- [ ] "Ask about this car" — AI analysis of individual listings
- [ ] Red flag detection in listing descriptions

### Phase 5 — Polish & Launch (Weeks 12–14)
- [ ] Mobile responsiveness + PWA support
- [ ] Saved searches with email alerts
- [ ] User dashboard (favorites, history, notes)
- [ ] SEO optimization
- [ ] Performance optimization + load testing
- [ ] Beta launch + feedback collection

---

## Database Schema (Core Tables)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    zip_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Search Preferences
CREATE TABLE search_preferences (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    budget_min INTEGER,
    budget_max INTEGER,
    body_types TEXT[],         -- ['sedan', 'suv']
    fuel_types TEXT[],         -- ['gasoline', 'hybrid']
    max_mileage INTEGER,
    year_min INTEGER,
    year_max INTEGER,
    transmission TEXT[],
    drivetrain TEXT[],
    features TEXT[],
    brands TEXT[],
    radius_miles INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cached Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY,
    source VARCHAR(50),        -- 'cargurus', 'autotrader', etc.
    source_id VARCHAR(255),
    title VARCHAR(500),
    price INTEGER,
    year INTEGER,
    make VARCHAR(100),
    model VARCHAR(100),
    trim VARCHAR(200),
    mileage INTEGER,
    body_type VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    drivetrain VARCHAR(50),
    exterior_color VARCHAR(50),
    features TEXT[],
    image_urls TEXT[],
    listing_url TEXT,
    dealer_name VARCHAR(255),
    dealer_type VARCHAR(20),   -- 'dealer' or 'private'
    location_zip VARCHAR(10),
    ai_deal_score FLOAT,
    fetched_at TIMESTAMP DEFAULT NOW()
);

-- Saved Favorites
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id),
    listing_id UUID REFERENCES listings(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

-- RAG Documents
CREATE TABLE rag_documents (
    id UUID PRIMARY KEY,
    title VARCHAR(500),
    category VARCHAR(100),
    content TEXT,
    chunk_index INTEGER,
    embedding_id VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## RAG Knowledge Base — Document Categories

1. **pre-purchase-inspection.md** — 50-point inspection checklist
2. **vehicle-history-reports.md** — How to read Carfax/AutoCheck
3. **red-flags.md** — Warning signs in listings and during viewings
4. **negotiation-guide.md** — Scripts, tactics, when to walk away
5. **financing-101.md** — Loan types, APR, pre-approval, dealer markup
6. **title-types.md** — Clean, salvage, rebuilt, flood, lemon
7. **state-regulations/** — Per-state lemon laws, emissions, registration
8. **insurance-guide.md** — Coverage types, how to compare quotes
9. **warranty-options.md** — CPO, extended, powertrain, bumper-to-bumper
10. **common-scams.md** — Odometer fraud, curbstoning, title washing
11. **test-drive-checklist.md** — What to check, questions to ask
12. **post-purchase-steps.md** — Registration, insurance, first maintenance
13. **ev-buying-guide.md** — Battery health, charging, tax credits
14. **pricing-guide.md** — How KBB/Edmunds/NADA values work
15. **dealer-vs-private.md** — Pros/cons, legal protections

---

## API Endpoints (Draft)

```
POST   /api/auth/register
POST   /api/auth/login

POST   /api/preferences          — save search preferences
GET    /api/preferences/:id      — get saved preferences

GET    /api/search               — search listings (with filters)
GET    /api/listings/:id         — single listing detail
POST   /api/listings/:id/analyze — AI analysis of a listing

POST   /api/favorites            — save a favorite
GET    /api/favorites             — get user's favorites
DELETE /api/favorites/:id        — remove a favorite

POST   /api/chat                 — RAG chat endpoint
GET    /api/chat/history         — chat history

GET    /api/compare?ids=a,b,c    — AI comparison of listings
GET    /api/trends/:make/:model  — price trend data
```

---

## Estimated Costs (Monthly, at scale)

| Service          | Estimated Cost   |
|-----------------|------------------|
| Claude API       | $50–200          |
| Vercel hosting   | $20              |
| Railway backend  | $20–50           |
| Pinecone (RAG)   | $0–70            |
| PostgreSQL (Neon)| $0–25            |
| Proxy service    | $50–100          |
| **Total**        | **$140–465/mo**  |

---

## Getting Started — Next Steps

1. Clone the starter prototype (provided as the interactive React app)
2. Set up your development environment (Node 18+, Python 3.11+)
3. Get API keys: Anthropic (Claude), and optionally Voyage AI
4. Start with Phase 1 — the preference wizard and Claude integration
5. Gradually add scraper modules for each marketplace
