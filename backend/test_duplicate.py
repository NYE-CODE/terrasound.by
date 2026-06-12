import uuid
from app.database import SessionLocal
from app.models.product import Product
from app.models.attribute import ProductAttributeValue
from app.services.product_admin import duplicate_product, update_product
from app.schemas.content import ProductUpdate
from app.services.attributes import sync_product_attributes

db = SessionLocal()
try:
    # Find any product
    p = db.query(Product).first()
    if p:
        print("Duplicating", p.id)
        new_p = duplicate_product(db, p.id)
        print("Duplicated as", new_p.id)
        
        # Now try to update it
        payload = ProductUpdate(
            brand=new_p.brand,
            name=new_p.name + " updated",
            price=new_p.price,
            sale_price=new_p.sale_price,
            category=new_p.category,
            image_url=new_p.image_url,
            specs_short=new_p.specs_short,
            in_stock=new_p.in_stock,
            images=[img.url for img in new_p.images],
            specs={s.key: s.value for s in new_p.specs},
            attributes={a.attribute_id: a.value_string or a.value_number or a.value_bool for a in new_p.attribute_values},
            compatibility=[c.vehicle for c in new_p.compatibility]
        )
        update_product(db, new_p.id, payload)
        print("Updated successfully")
except Exception as e:
    print("Error:", e)
finally:
    db.rollback()
    db.close()
