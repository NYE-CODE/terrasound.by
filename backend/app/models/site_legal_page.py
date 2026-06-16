from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

LEGAL_PAGE_PRIVACY = "privacy"
LEGAL_PAGE_TERMS = "terms"
LEGAL_PAGE_SLUGS = frozenset({LEGAL_PAGE_PRIVACY, LEGAL_PAGE_TERMS})


class SiteLegalPage(Base):
    __tablename__ = "site_legal_pages"

    slug: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
