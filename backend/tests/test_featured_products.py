import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.product import Product
from app.services.products import list_featured_products


class FeaturedProductsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()
        self.db.add_all(
            [
                Product(
                    id=str(uuid.uuid4()),
                    brand="A",
                    name="Alpha",
                    price=100,
                    category="speakers",
                    image_url="/uploads/products/a.webp",
                    featured_on_home=True,
                ),
                Product(
                    id=str(uuid.uuid4()),
                    brand="B",
                    name="Beta",
                    price=200,
                    category="speakers",
                    image_url="/uploads/products/b.webp",
                    featured_on_home=False,
                ),
                Product(
                    id=str(uuid.uuid4()),
                    brand="C",
                    name="Charlie",
                    price=300,
                    category="speakers",
                    image_url="/uploads/products/c.webp",
                    featured_on_home=True,
                ),
            ]
        )
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()

    def test_list_featured_products_returns_only_flagged_items_sorted_by_name(self) -> None:
        items = list_featured_products(self.db)

        self.assertEqual([item.name for item in items], ["Alpha", "Charlie"])
