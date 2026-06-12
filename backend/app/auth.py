from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.auth import AdminUser
from app.services.admin_account import get_or_create_admin_account

ALGORITHM = "HS256"
security = HTTPBearer()


def create_access_token(subject: str, token_version: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire, "ver": token_version}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_current_admin(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminUser:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
        token_version = payload.get("ver")
        if not username or token_version is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    account = get_or_create_admin_account(db)
    # ver в JWT должен совпадать с token_version — иначе сессия отозвана (смена пароля).
    if username != account.username or token_version != account.token_version:
        raise credentials_exception
    return AdminUser(username=username)
