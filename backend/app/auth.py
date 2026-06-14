from datetime import datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.auth import AdminUser
from app.services.admin_account import get_or_create_admin_account

ALGORITHM = "HS256"
ADMIN_SESSION_COOKIE = "terrasound_admin_session"
security = HTTPBearer(auto_error=False)


def create_access_token(subject: str, token_version: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire, "ver": token_version}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=ADMIN_SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        ADMIN_SESSION_COOKIE,
        path="/",
        secure=settings.is_production,
        samesite="lax",
        httponly=True,
    )


def empty_response(response: Response | None = None) -> Response:
    if response is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


def get_current_admin(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminUser:
    token = request.cookies.get(ADMIN_SESSION_COOKIE)
    if not token and credentials is not None:
        token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
        token_version = payload.get("ver")
        if not username or token_version is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    account = get_or_create_admin_account(db)
    if username != account.username or token_version != account.token_version:
        raise credentials_exception
    return AdminUser(username=username)
