import unittest

from app.services import lead_emails
from app.services.email_sender import _ASCII_FROM_NAME


class LeadEmailBrandingTests(unittest.TestCase):
    def test_site_name_uses_capital_z_in_zvuka(self) -> None:
        self.assertEqual(lead_emails.SITE_NAME, "Территория Звука")
        self.assertIn("Территория Звука", lead_emails.CLIENT_SIGN_OFF_TEXT)
        self.assertIn("Территория Звука", lead_emails._client_sign_off_html())

    def test_payment_methods_info_in_text_block(self) -> None:
        block = lead_emails._payment_methods_text_block()
        self.assertIn("Способы оплаты:", block)
        self.assertIn("Расчетная система ЕРИП", block)
        self.assertNotIn("Способ оплаты:", block)

    def test_ascii_from_name_uses_capital_z(self) -> None:
        self.assertEqual(_ASCII_FROM_NAME, "Territoriya Zvuka")

    def test_delivery_location_when_address_empty(self) -> None:
        self.assertEqual(
            lead_emails._format_order_delivery_location("Гродно", ""),
            "Гродно",
        )
        self.assertEqual(
            lead_emails._format_order_delivery_location("", ""),
            "не указан",
        )


if __name__ == "__main__":
    unittest.main()
