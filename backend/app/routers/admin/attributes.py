from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api_constants import ADMIN_V1_PREFIX
from app.database import get_db
from app.routers.admin.deps import ADMIN_ROUTER_DEPENDENCIES
from app.schemas.attribute import (
    AttributeCreate,
    AttributeOut,
    AttributeUpdate,
    CategoryAttributeOut,
    CategoryAttributeSchemaOut,
    CategoryAttributeSync,
)
from app.schemas.pagination import PaginatedOut, paginated
from app.services.attributes import (
    create_attribute,
    delete_attribute,
    get_category_form_schema,
    list_attributes,
    list_category_attributes,
    sync_category_attributes,
    update_attribute,
)

router = APIRouter(prefix=ADMIN_V1_PREFIX, tags=["admin-attributes"], dependencies=ADMIN_ROUTER_DEPENDENCIES)

DEFAULT_LIST_LIMIT = 200
MAX_LIST_LIMIT = 500


@router.get("/attributes", response_model=PaginatedOut[AttributeOut])
def list_attributes_admin(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=DEFAULT_LIST_LIMIT, ge=1, le=MAX_LIST_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> PaginatedOut[AttributeOut]:
    items = list_attributes(db)
    total = len(items)
    page = items[offset : offset + limit]
    return paginated(page, total=total, limit=limit, offset=offset)


@router.get("/attributes/{attribute_id}", response_model=AttributeOut)
def get_attribute_admin(
    attribute_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> AttributeOut:
    from app.services.attributes import attribute_to_out, get_attribute_or_404

    return attribute_to_out(get_attribute_or_404(db, attribute_id))


@router.post("/attributes", response_model=AttributeOut, status_code=201)
def create_attribute_admin(
    payload: AttributeCreate,
    db: Annotated[Session, Depends(get_db)],
) -> AttributeOut:
    attribute = create_attribute(db, payload)
    from app.services.attributes import attribute_to_out

    return attribute_to_out(attribute)


@router.patch("/attributes/{attribute_id}", response_model=AttributeOut)
def update_attribute_admin(
    attribute_id: str,
    payload: AttributeUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> AttributeOut:
    attribute = update_attribute(db, attribute_id, payload)
    from app.services.attributes import attribute_to_out

    return attribute_to_out(attribute)


@router.delete("/attributes/{attribute_id}", status_code=204)
def delete_attribute_admin(
    attribute_id: str,
    db: Annotated[Session, Depends(get_db)],
    strategy: Literal["default", "cascade"] = Query("default"),
) -> None:
    delete_attribute(db, attribute_id, strategy=strategy)


@router.get("/categories/{category_id}/attributes")
def list_category_attributes_admin(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
    view: Literal["default", "form"] = Query(default="default"),
) -> list[CategoryAttributeOut] | list[CategoryAttributeSchemaOut]:
    """view=form — схема полей товара; default — полные привязки для редактора категории."""
    if view == "form":
        return get_category_form_schema(db, category_id)
    return list_category_attributes(db, category_id)


@router.put("/categories/{category_id}/attributes", response_model=list[CategoryAttributeOut])
def sync_category_attributes_admin(
    category_id: str,
    payload: CategoryAttributeSync,
    db: Annotated[Session, Depends(get_db)],
) -> list[CategoryAttributeOut]:
    """PUT заменяет весь набор привязок категории (удаляет отсутствующие в payload)."""
    return sync_category_attributes(db, category_id, payload.items)
