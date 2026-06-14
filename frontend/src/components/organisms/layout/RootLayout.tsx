import { Suspense, useMemo } from "react";
import { Outlet } from "react-router";
import { ScrollToTop } from "../../ScrollToTop";
import { JsonLd } from "../../seo/JsonLd";
import { SiteHeader } from "./SiteHeader";
import { Footer } from "./Footer";
import { CartProvider } from "../../../context/CartContext";
import { CategoriesProvider } from "../../../context/CategoriesContext";
import { SiteAnnouncementProvider } from "../../../context/SiteAnnouncementContext";
import { ProductHighlightsProvider } from "../../../context/ProductHighlightsContext";
import { SiteContactProvider, useSiteContact } from "../../../context/SiteContactContext";
import { COMPANY_NAME, SITE_NAME, SITE_ORIGIN, TAGLINE } from "../../../lib/site";

function RootLayoutContent() {
  const contact = useSiteContact();

  const localBusiness = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: SITE_NAME,
      legalName: COMPANY_NAME,
      description: TAGLINE,
      url: SITE_ORIGIN,
      telephone: contact.phone,
      email: contact.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Гродно",
        addressCountry: "BY",
        streetAddress: contact.address,
      },
      priceRange: "$$",
    }),
    [contact.address, contact.email, contact.phone],
  );

  return (
    <>
      <JsonLd id="local-business" data={localBusiness} />
      <ScrollToTop />
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}

export function RootLayout() {
  return (
    <CartProvider>
      <SiteContactProvider>
        <SiteAnnouncementProvider>
          <ProductHighlightsProvider>
            <CategoriesProvider>
              <RootLayoutContent />
            </CategoriesProvider>
          </ProductHighlightsProvider>
        </SiteAnnouncementProvider>
      </SiteContactProvider>
    </CartProvider>
  );
}
