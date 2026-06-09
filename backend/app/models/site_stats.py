from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteStats(Base):
    __tablename__ = "site_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    installations_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=1200)
    years_expertise: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
