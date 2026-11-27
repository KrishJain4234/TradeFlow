from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db import get_db
from app.core.models import User, UserSession
from app.core.security import hash_token


def _get_session_from_request(request: Request, db: Session) -> tuple[User, UserSession]:
    raw_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    token_hash = hash_token(raw_token)
    session = (
        db.query(UserSession)
        .filter(UserSession.token_hash == token_hash, UserSession.revoked_at.is_(None))
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user, session


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user, _ = _get_session_from_request(request, db)
    return user


def require_csrf(request: Request, db: Session = Depends(get_db)) -> User:
    user, session = _get_session_from_request(request, db)
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        csrf_header = request.headers.get("X-CSRF-Token")
        if not csrf_header or csrf_header != session.csrf_token:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing or invalid")
    return user


def require_broker(user: User = Depends(get_current_user)) -> User:
    if user.role != "BROKER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Broker role required")
    return user


def require_broker_csrf(user: User = Depends(require_csrf)) -> User:
    if user.role != "BROKER":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Broker role required")
    return user
