import unittest

from pydantic import ValidationError

from app.schemas.order import ContactIn, OrderCreate, OrderItemIn


class OrderContactAddressTests(unittest.TestCase):
    def test_contact_accepts_empty_address(self) -> None:
        contact = ContactIn(
            name="Иван Иванов",
            phone="+375291234567",
            email="test@example.com",
            city="Гродно",
            address="",
        )
        self.assertEqual(contact.address, "")

    def test_contact_strips_address_whitespace(self) -> None:
        contact = ContactIn(
            name="Иван Иванов",
            phone="+375291234567",
            email="test@example.com",
            city="Гродно",
            address="  ул. Советская 15  ",
        )
        self.assertEqual(contact.address, "ул. Советская 15")

    def test_order_create_without_address(self) -> None:
        payload = OrderCreate(
            contact={
                "name": "Иван Иванов",
                "phone": "+375291234567",
                "email": "test@example.com",
                "city": "Гродно",
            },
            car={},
            items=[{"productId": "1", "quantity": 1}],
        )
        self.assertEqual(payload.contact.address, "")

    def test_contact_rejects_address_over_max_length(self) -> None:
        with self.assertRaises(ValidationError):
            ContactIn(
                name="Иван Иванов",
                phone="+375291234567",
                email="test@example.com",
                address="x" * 501,
            )


if __name__ == "__main__":
    unittest.main()
