from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

DEFAULT_ANNOUNCEMENT_SCROLL_DURATION_SECONDS = 45


class SiteAnnouncement(Base):
    __tablename__ = "site_announcement"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    text: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    scroll_duration_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=DEFAULT_ANNOUNCEMENT_SCROLL_DURATION_SECONDS,
    )
