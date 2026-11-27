from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db import get_db
from app.core.models import User, UserSession, Portfolio, LedgerAccount, Watchlist
from app.core.security import (
    hash_password, verify_password, generate_session_token, generate_csrf_token, hash_token
)
from app.audit.service import record_audit_event
from app.auth.deps import get_current_user, require_csrf
from app.auth.schemas import RegisterRequest, LoginRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_session(response: Response, db: Session, user: User) -> str:
    raw_token = generate_session_token()
    csrf_token = generate_csrf_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.SESSION_EXPIRE_HOURS)

    sess = UserSession(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        csrf_token=csrf_token,
        expires_at=expires_at,
    )
    db.add(sess)
    db.flush()

    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        samesite="lax",
        max_age=settings.SESSION_EXPIRE_HOURS * 3600,
        path="/",
    )
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        samesite="lax",
        max_age=settings.SESSION_EXPIRE_HOURS * 3600,
        path="/",
    )
    return csrf_token


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role="CLIENT",
        preferred_language=payload.preferred_language,
    )
    db.add(user)
    db.flush()

    portfolio = Portfolio(user_id=user.id, available_balance=Decimal("500000.00"))
    db.add(portfolio)
    db.flush()

    db.add(LedgerAccount(portfolio_id=portfolio.id, account_type="CASH_INR"))
    db.add(Watchlist(user_id=user.id, name="My Watchlist"))

    csrf_token = _issue_session(response, db, user)
    record_audit_event(db, user.id, "USER_REGISTERED", user.id, {"email": user.email})
    db.commit()

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        broker_id=user.broker_id,
        preferred_language=user.preferred_language,
        csrf_token=csrf_token,
    )


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    csrf_token = _issue_session(response, db, user)
    record_audit_event(db, user.id, "USER_LOGIN", user.id)
    db.commit()

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        broker_id=user.broker_id,
        preferred_language=user.preferred_language,
        csrf_token=csrf_token,
    )


@router.post("/logout")
def logout(request: Request, response: Response, user: User = Depends(require_csrf), db: Session = Depends(get_db)):
    raw_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if raw_token:
        sess = db.query(UserSession).filter(UserSession.token_hash == hash_token(raw_token)).first()
        if sess:
            sess.revoked_at = datetime.now(timezone.utc)
    record_audit_event(db, user.id, "USER_LOGOUT", user.id)
    db.commit()
    response.delete_cookie(settings.SESSION_COOKIE_NAME, path="/")
    response.delete_cookie(settings.CSRF_COOKIE_NAME, path="/")
    return {"status": "logged_out"}


@router.get("/me", response_model=UserResponse)
def me(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    raw_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    sess = db.query(UserSession).filter(UserSession.token_hash == hash_token(raw_token)).first()
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        broker_id=user.broker_id,
        preferred_language=user.preferred_language,
        csrf_token=sess.csrf_token if sess else None,
    )
