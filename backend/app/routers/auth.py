from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from app.database import get_db
from app.models.db_models import User, AnalysisHistory
from app.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


class SignupRequest(BaseModel):
    email: str = Field(..., max_length=255)
    username: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str = Field(..., max_length=100)
    password: str = Field(..., max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: str


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_optional_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.id == user_id).first()


class HistoryItem(BaseModel):
    id: int
    profile_name: str
    profile_text: str
    extracted_skills: list
    top_categories: list
    avg_match_score: float
    jobs_matched: int
    created_at: str


@router.get("/history", response_model=list[HistoryItem])
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.user_id == current_user.id)
        .order_by(AnalysisHistory.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        HistoryItem(
            id=r.id,
            profile_name=r.profile_name or "",
            profile_text=r.profile_text,
            extracted_skills=r.extracted_skills or [],
            top_categories=r.top_categories or [],
            avg_match_score=r.avg_match_score or 0.0,
            jobs_matched=r.jobs_matched or 0,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    user = User(
        email=req.email,
        username=req.username,
        hashed_password=pwd_context.hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"user_id": user.id, "username": user.username})
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "username": user.username},
    )


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"user_id": user.id, "username": user.username})
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "username": user.username},
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        created_at=current_user.created_at.isoformat() if current_user.created_at else "",
    )
