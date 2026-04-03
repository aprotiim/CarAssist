"""
CarAssist FastAPI backend — Phase 1
Run with: uvicorn backend.main:app --reload --port 8000
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routers import chat, search, preferences

load_dotenv()

app = FastAPI(
    title="CarAssist API",
    description="AI-powered used car buying assistant backend",
    version="0.1.0",
)

# CORS — allow the Next.js dev server and production frontend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat.router)
app.include_router(search.router)
app.include_router(preferences.router)


@app.get("/")
async def root():
    return {
        "service": "CarAssist API",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "ok",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
