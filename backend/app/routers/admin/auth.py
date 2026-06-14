from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.auth import clear_session_cookie, create_access_token, get_current_admin, set_session_cookie
from app.database import get_db
from app.schemas.auth import AdminUser, ChangePasswordRequest, LoginRequest
from app.services.admin_account import authenticate_admin, change_admin_password, get_or_create_admin_account

router = APIRouter(prefix=f"{ADMIN_V1_PREFIX}", tags=["admin-auth"])


@router.post("/sessions", status_code=204, response_class=Response)
def create_session(
    payload: LoginRequest,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    """Выдача сессии в httpOnly-cookie после проверки учётных данных администратора."""
    if not authenticate_admin(db, payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )
    account = get_or_create_admin_account(db)
    token = create_access_token(account.username, account.token_version)
    set_session_cookie(response, token)
    return Response(status_code=204)


@router.delete("/sessions", status_code=204, response_class=Response)
def delete_session(response: Response) -> Response:
    clear_session_cookie(response)
    return Response(status_code=204)


@router.patch("/me/password", status_code=204, response_class=Response)
def change_password(
    payload: ChangePasswordRequest,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> Response:
    change_admin_password(db, payload.current_password, payload.new_password)
    clear_session_cookie(response)
    return Response(status_code=204)
