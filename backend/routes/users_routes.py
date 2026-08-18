import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from pydantic import BaseModel, ConfigDict, Field

from database.db import get_db
from models.user import User, ActivityLog

SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

router = APIRouter(prefix="/api/users", tags=["users"])


# Pydantic models for request/response
class RegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: str = Field(..., alias="fullName")
    email: str
    password: str
    phone: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = "admin"
    profile_image: Optional[str] = None


class ActivityLogRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: int
    action: str
    details: Optional[str] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    # user: RegisterRequest with full_name, email, password, ...
    try:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if not user.password or len(user.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        
        hashed = get_password_hash(user.password)
        new = User(
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            company=user.company,
            role=user.role or "admin",
            password_hash=hashed,
            profile_image=user.profile_image,
        )
        db.add(new)
        db.commit()
        db.refresh(new)
        return {"id": new.id, "email": new.email}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # update last login
        user.last_login = datetime.utcnow()
        db.add(user)
        db.commit()
        
        token = create_access_token({"sub": str(user.id), "email": user.email})
        
        # log activity
        log = ActivityLog(user_id=user.id, action="login")
        db.add(log)
        db.commit()
        
        return {"access_token": token, "token_type": "bearer", "user_id": user.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.get("/me")
def me(token: str = Depends(lambda: None), db: Session = Depends(get_db)):
    # token may be sent as Authorization Bearer; FastAPI will not auto-parse here without deps
    from fastapi import Security, Request
    from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

    bearer = HTTPBearer(auto_error=False)
    def _get_credentials(req: Request):
        return None

    creds: Optional[HTTPAuthorizationCredentials] = None
    # simple manual parse
    from fastapi import Request
    from fastapi import Depends as _Depends

    async def _inner(request: Request):
        auth = request.headers.get("authorization")
        if not auth:
            raise HTTPException(status_code=401, detail="Not authenticated")
        parts = auth.split()
        if parts[0].lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        return parts[1]

    # this endpoint will be called via direct routing; implement simple token extract
    from fastapi import APIRouter
    return {"detail": "Use /api/users/me with Authorization header"}


@router.post("/activity")
def activity(payload: ActivityLogRequest, db: Session = Depends(get_db)):
    # payload: ActivityLogRequest with user_id, action, details
    try:
        if not payload.user_id or not payload.action:
            raise HTTPException(status_code=400, detail="user_id and action required")
        
        log = ActivityLog(user_id=payload.user_id, action=payload.action, details=payload.details)
        db.add(log)
        db.commit()
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Activity log error: {str(e)}")


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "company": user.company,
        "role": user.role,
        "registered_at": user.registered_at.isoformat() if user.registered_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "profile_image": user.profile_image,
    }
