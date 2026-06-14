from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.db_commit import commit_or_raise
from app.models.admin_account import AdminAccount

from app.services.password_policy import validate_strong_password

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def get_or_create_admin_account(db: Session) -> AdminAccount:
    account = db.query(AdminAccount).filter(AdminAccount.id == 1).first()
    if account:
        return account

    account = AdminAccount(
        id=1,
        username=settings.admin_username,
        password_hash=hash_password(settings.admin_password),
    )
    db.add(account)
    commit_or_raise(db)
    db.refresh(account)
    return account


def authenticate_admin(db: Session, username: str, password: str) -> bool:
    account = get_or_create_admin_account(db)
    if username != account.username:
        return False
    return verify_password(password, account.password_hash)


def change_admin_password(
    db: Session,
    current_password: str,
    new_password: str,
) -> None:
    account = get_or_create_admin_account(db)
    if not verify_password(current_password, account.password_hash):
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль",
        )

    validate_strong_password(new_password)

    account.password_hash = hash_password(new_password)
    # Инвалидирует все выданные JWT — ver в токене перестаёт совпадать с БД.
    account.token_version += 1
    commit_or_raise(db)
