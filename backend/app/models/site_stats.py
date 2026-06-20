from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteStats(Base):
    __tablename__ = "site_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    installations_completed: Mapped[str] = mapped_column(String(64), nullable=False, default="1200+")
    years_expertise: Mapped[str] = mapped_column(String(64), nullable=False, default="8")
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
