from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ProductHighlights(Base):
    __tablename__ = "product_highlights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    highlights_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
