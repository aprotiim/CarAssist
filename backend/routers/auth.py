"""
Auth router — register and login endpoints backed by S3.
"""
import bcrypt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from backend.services.s3_user_service import get_user_by_email, create_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str


@router.post("/register", response_model=UserOut, status_code=201)
def register(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    try:
        user = create_user(name=req.name, email=str(req.email), hashed_password=hashed)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return UserOut(id=user["id"], name=user["name"], email=user["email"])


@router.post("/login", response_model=UserOut)
def login(req: LoginRequest):
    user = get_user_by_email(str(req.email))
    if not user or not bcrypt.checkpw(req.password.encode(), user["hashed_password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return UserOut(id=user["id"], name=user["name"], email=user["email"])
