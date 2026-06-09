import { useMemo } from "react";
import { Outlet } from "react-router";
import { ScrollToTop } from "../../ScrollToTop";
import { JsonLd } from "../../seo/JsonLd";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartProvider } from "../../../context/CartContext";
import {
  ADDRESS,
  COMPANY_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_NAME,
  SITE_ORIGIN,
  TAGLINE,
} from "../../../lib/site";

export function RootLayout() {
  const localBusiness = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: SITE_NAME,
      legalName: COMPANY_NAME,
      description: TAGLINE,
      url: SITE_ORIGIN,
      telephone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Гродно",
        addressCountry: "BY",
        streetAddress: ADDRESS,
      },
      priceRange: "$$",
    }),
    [],
  );

  return (
    <CartProvider>
      <JsonLd id="local-business" data={localBusiness} />
      <ScrollToTop />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
