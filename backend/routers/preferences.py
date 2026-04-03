"""
Preferences router — Phase 1 stores preferences in-memory.
Phase 2+ will persist to PostgreSQL.
"""
from fastapi import APIRouter, HTTPException
from uuid import uuid4
from backend.models.schemas import SearchPreferences

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

# In-memory store (replace with DB in Phase 2)
_store: dict[str, SearchPreferences] = {}


@router.post("", response_model=dict)
async def save_preferences(prefs: SearchPreferences) -> dict:
    pref_id = str(uuid4())
    _store[pref_id] = prefs
    return {"id": pref_id, "message": "Preferences saved"}


@router.get("/{pref_id}", response_model=SearchPreferences)
async def get_preferences(pref_id: str) -> SearchPreferences:
    prefs = _store.get(pref_id)
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return prefs
