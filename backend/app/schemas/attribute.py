from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.common import CamelModel


class AttributeOptionOut(CamelModel):
    value: str
    label: str
    sort_order: int


class AttributeOut(CamelModel):
    id: str
    label: str
    value_type: str
    unit: str | None = None
    options: list[AttributeOptionOut] = []


class AttributeOptionInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    value: str = Field(min_length=1)
    label: str = Field(min_length=1)
    sort_order: int = 0


class AttributeCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    id: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9]+(?:_[a-z0-9]+)*$")
    label: str = Field(min_length=1)
    value_type: str = Field(pattern=r"^(enum|number|boolean|text)$")
    unit: str | None = None
    options: list[AttributeOptionInput] = []


class AttributeUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    label: str | None = None
    value_type: str | None = Field(default=None, pattern=r"^(enum|number|boolean|text)$")
    unit: str | None = None
    options: list[AttributeOptionInput] | None = None


class CategoryAttributeOut(CamelModel):
    id: int
    category_id: str
    attribute_id: str
    attribute_label: str
    value_type: str
    unit: str | None = None
    options: list[AttributeOptionOut] = []
    show_in_form: bool
    show_in_filters: bool
    show_on_card: bool
    filter_type: str | None = None
    filter_min: float | None = None
    filter_max: float | None = None
    filter_step: float | None = None
    required: bool
    sort_order: int
    group_label: str | None = None


class CategoryAttributeCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    attribute_id: str = Field(min_length=1)
    show_in_form: bool = True
    show_in_filters: bool = False
    show_on_card: bool = False
    filter_type: str | None = Field(default=None, pattern=r"^(checkbox|dropdown|multiselect|range)$")
    filter_min: float | None = None
    filter_max: float | None = None
    filter_step: float | None = None
    required: bool = False
    sort_order: int = 0
    group_label: str | None = None


class CategoryAttributeUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    show_in_form: bool | None = None
    show_in_filters: bool | None = None
    show_on_card: bool | None = None
    filter_type: str | None = Field(default=None, pattern=r"^(checkbox|dropdown|multiselect|range)$")
    filter_min: float | None = None
    filter_max: float | None = None
    filter_step: float | None = None
    required: bool | None = None
    sort_order: int | None = None
    group_label: str | None = None


class CategoryFilterOut(CamelModel):
    attribute_id: str
    label: str
    value_type: str
    filter_type: str
    unit: str | None = None
    options: list[AttributeOptionOut] = []
    filter_min: float | None = None
    filter_max: float | None = None
    filter_step: float | None = None
    group_label: str | None = None
    sort_order: int


class CategoryFiltersOut(CamelModel):
    category_id: str
    price_min: float = 0
    price_max: float = 5000
    filters: list[CategoryFilterOut] = []


class CategoryAttributeSchemaOut(CamelModel):
    attribute_id: str
    label: str
    value_type: str
    unit: str | None = None
    options: list[AttributeOptionOut] = []
    required: bool
    sort_order: int
    group_label: str | None = None
