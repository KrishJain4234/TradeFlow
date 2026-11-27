from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User
from app.auth.deps import get_current_user
from app.portfolio.schemas import PortfolioResponse
from app.portfolio.service import get_user_portfolio

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioResponse)
def read_portfolio(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_portfolio(db, user.id)
