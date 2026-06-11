from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Attribute(Base):
    __tablename__ = "attributes"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    label: Mapped[str] = mapped_column(String(150), nullable=False)
    value_type: Mapped[str] = mapped_column(String(20), nullable=False)  # enum | number | boolean | text
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
    filter_type: Mapped[str | None] = mapped_column(String(20), nullable=True)  # checkbox | dropdown | dropdown_multiselect | multiselect | range

    options: Mapped[list["AttributeOption"]] = relationship(
        back_populates="attribute", cascade="all, delete-orphan", order_by="AttributeOption.sort_order"
    )
    category_links: Mapped[list["CategoryAttribute"]] = relationship(
        back_populates="attribute", cascade="all, delete-orphan"
    )


class AttributeOption(Base):
    __tablename__ = "attribute_options"
    __table_args__ = (UniqueConstraint("attribute_id", "value", name="uq_attribute_option_value"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attribute_id: Mapped[str] = mapped_column(String(80), ForeignKey("attributes.id"), nullable=False)
    value: Mapped[str] = mapped_column(String(100), nullable=False)
    label: Mapped[str] = mapped_column(String(150), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    attribute: Mapped["Attribute"] = relationship(back_populates="options")


class CategoryAttribute(Base):
    __tablename__ = "category_attributes"
    __table_args__ = (UniqueConstraint("category_id", "attribute_id", name="uq_category_attribute"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[str] = mapped_column(String(50), ForeignKey("categories.id"), nullable=False)
    attribute_id: Mapped[str] = mapped_column(String(80), ForeignKey("attributes.id"), nullable=False)
    show_in_form: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_in_filters: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_on_card: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    filter_type: Mapped[str | None] = mapped_column(String(20), nullable=True)  # checkbox | dropdown | dropdown_multiselect | multiselect | range
    filter_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    filter_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    filter_step: Mapped[float | None] = mapped_column(Float, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    group_label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    attribute: Mapped["Attribute"] = relationship(back_populates="category_links")


class ProductAttributeValue(Base):
    __tablename__ = "product_attribute_values"
    __table_args__ = (UniqueConstraint("product_id", "attribute_id", name="uq_product_attribute"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    attribute_id: Mapped[str] = mapped_column(String(80), ForeignKey("attributes.id"), nullable=False)
    value_string: Mapped[str | None] = mapped_column(String(255), nullable=True)
    value_number: Mapped[float | None] = mapped_column(Float, nullable=True)
    value_bool: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    product: Mapped["Product"] = relationship("Product", back_populates="attribute_values")
