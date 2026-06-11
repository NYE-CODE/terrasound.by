from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.schemas.attribute import (
    AttributeCreate,
    AttributeOut,
    AttributeUpdate,
    CategoryAttributeCreate,
    CategoryAttributeOut,
    CategoryAttributeSchemaOut,
    CategoryAttributeUpdate,
)
from app.schemas.auth import AdminUser
from app.services.attributes import (
    create_attribute,
    create_category_attribute,
    delete_attribute,
    delete_category_attribute,
    get_category_form_schema,
    list_attributes,
    list_category_attributes,
    update_attribute,
    update_category_attribute,
)

router = APIRouter(tags=["admin-attributes"])


@router.get("/api/admin/attributes", response_model=list[AttributeOut])
def list_attributes_admin(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[AttributeOut]:
    return list_attributes(db)


@router.get("/api/admin/attributes/{attribute_id}", response_model=AttributeOut)
def get_attribute_admin(
    attribute_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> AttributeOut:
    from app.services.attributes import attribute_to_out, get_attribute_or_404

    return attribute_to_out(get_attribute_or_404(db, attribute_id))


@router.post("/api/admin/attributes", response_model=AttributeOut, status_code=201)
def create_attribute_admin(
    payload: AttributeCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> AttributeOut:
    attribute = create_attribute(db, payload)
    from app.services.attributes import attribute_to_out

    return attribute_to_out(attribute)


@router.patch("/api/admin/attributes/{attribute_id}", response_model=AttributeOut)
def update_attribute_admin(
    attribute_id: str,
    payload: AttributeUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> AttributeOut:
    attribute = update_attribute(db, attribute_id, payload)
    from app.services.attributes import attribute_to_out

    return attribute_to_out(attribute)


@router.delete("/api/admin/attributes/{attribute_id}", status_code=204)
def delete_attribute_admin(
    attribute_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> None:
    delete_attribute(db, attribute_id)


@router.get("/api/admin/categories/{category_id}/attributes", response_model=list[CategoryAttributeOut])
def list_category_attributes_admin(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[CategoryAttributeOut]:
    return list_category_attributes(db, category_id)


@router.get(
    "/api/admin/categories/{category_id}/attribute-schema",
    response_model=list[CategoryAttributeSchemaOut],
)
def category_attribute_schema_admin(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[CategoryAttributeSchemaOut]:
    return get_category_form_schema(db, category_id)


@router.post(
    "/api/admin/categories/{category_id}/attributes",
    response_model=CategoryAttributeOut,
    status_code=201,
)
def create_category_attribute_admin(
    category_id: str,
    payload: CategoryAttributeCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> CategoryAttributeOut:
    return create_category_attribute(db, category_id, payload)


@router.patch(
    "/api/admin/categories/{category_id}/attributes/{link_id}",
    response_model=CategoryAttributeOut,
)
def update_category_attribute_admin(
    category_id: str,
    link_id: int,
    payload: CategoryAttributeUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> CategoryAttributeOut:
    return update_category_attribute(db, category_id, link_id, payload)


@router.delete("/api/admin/categories/{category_id}/attributes/{link_id}", status_code=204)
def delete_category_attribute_admin(
    category_id: str,
    link_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> None:
    delete_category_attribute(db, category_id, link_id)
