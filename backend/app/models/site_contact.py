from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteContact(Base):
    __tablename__ = "site_contact"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    instagram_url: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    tiktok_url: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    address: Mapped[str] = mapped_column(String(512), nullable=False)
