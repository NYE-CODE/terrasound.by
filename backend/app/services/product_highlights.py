import json

from sqlalchemy.orm import Session

from app.cache import PRODUCT_HIGHLIGHTS, product_highlights_cache
from app.db_commit import commit_or_raise
from app.models.product_highlights import ProductHighlights
from app.schemas.product_highlights import ProductHighlightsOut, ProductHighlightsUpdate

DEFAULT_HIGHLIGHTS = [
    "Бесплатная консультация перед покупкой",
    "Гарантия 2 года на всё оборудование",
    "Доступна профессиональная установка",
]


def _encode_highlights(highlights: list[str]) -> str:
    return json.dumps(highlights, ensure_ascii=False)


def _decode_highlights(raw: str) -> list[str]:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return list(DEFAULT_HIGHLIGHTS)
    if not isinstance(data, list):
        return list(DEFAULT_HIGHLIGHTS)
    return [str(item).strip() for item in data if str(item).strip()]


def get_or_create_product_highlights(db: Session) -> ProductHighlights:
    row = db.query(ProductHighlights).filter(ProductHighlights.id == 1).first()
    if row:
        return row

    row = ProductHighlights(id=1, highlights_json=_encode_highlights(DEFAULT_HIGHLIGHTS))
    db.add(row)
    commit_or_raise(db)
    db.refresh(row)
    return row


def product_highlights_to_out(row: ProductHighlights) -> ProductHighlightsOut:
    return ProductHighlightsOut(highlights=_decode_highlights(row.highlights_json))


def get_public_product_highlights(db: Session) -> ProductHighlightsOut:
    def load() -> dict:
        return product_highlights_to_out(get_or_create_product_highlights(db)).model_dump(by_alias=True)

    data = product_highlights_cache.get(PRODUCT_HIGHLIGHTS, load)
    return ProductHighlightsOut.model_validate(data)


def update_product_highlights(db: Session, payload: ProductHighlightsUpdate) -> ProductHighlights:
    row = get_or_create_product_highlights(db)
    row.highlights_json = _encode_highlights(payload.highlights)
    commit_or_raise(db)
    db.refresh(row)
    product_highlights_cache.invalidate(PRODUCT_HIGHLIGHTS)
    return row
