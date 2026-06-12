from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.auth import create_access_token, get_current_admin
from app.database import get_db
from app.schemas.auth import AdminUser, ChangePasswordRequest, LoginRequest, TokenResponse
from app.services.admin_account import authenticate_admin, change_admin_password, get_or_create_admin_account

router = APIRouter(prefix=f"{ADMIN_V1_PREFIX}", tags=["admin-auth"])


@router.post("/sessions", response_model=TokenResponse, status_code=201)
def create_session(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    """Выдача JWT после проверки учётных данных администратора."""
    if not authenticate_admin(db, payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )
    account = get_or_create_admin_account(db)
    token = create_access_token(account.username, account.token_version)
    return TokenResponse(access_token=token)


@router.patch("/me/password")
def change_password(
    payload: ChangePasswordRequest,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, str]:
    change_admin_password(db, payload.current_password, payload.new_password)
    return {"message": "Пароль обновлён"}
