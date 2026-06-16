import { COMPANY_NAME, DEFAULT_SITE_CONTACT, SITE_NAME, SITE_ORIGIN, TAGLINE } from "./site";
import type { SiteContact } from "./api";

const OG_IMAGE_PATH = "/android-chrome-192x192.png";

function effectivePrice(price: number, salePrice?: number | null): number {
  if (salePrice != null && salePrice > 0 && salePrice < price) return salePrice;
  return price;
}

function contactOrDefault(contact: SiteContact): SiteContact {
  return contact ?? DEFAULT_SITE_CONTACT;
}

export function buildLocalBusinessSchema(contact: SiteContact) {
  const data = contactOrDefault(contact);
  const sameAs = [data.instagramUrl, data.tiktokUrl, data.telegramUrl].filter(
    (url) => url.trim().length > 0,
  );

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    legalName: COMPANY_NAME,
    description: TAGLINE,
    url: SITE_ORIGIN,
    image: `${SITE_ORIGIN}${OG_IMAGE_PATH}`,
    telephone: data.phone,
    email: data.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Гродно",
      addressCountry: "BY",
      streetAddress: data.address,
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
  };

  if (data.mapLat != null && data.mapLon != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: data.mapLat,
      longitude: data.mapLon,
    };
  }

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (data.workingHours.trim()) {
    schema.description = `${TAGLINE} Режим работы: ${data.workingHours.trim()}.`;
  }

  return schema;
}

export function buildProductSchema(product: {
  id: string;
  brand: string;
  name: string;
  price: number;
  salePrice?: number | null;
  inStock?: boolean;
  images: string[];
  specs?: Record<string, string>;
  ratingAvg?: number | null;
  reviewCount?: number;
}) {
  const price = effectivePrice(product.price, product.salePrice);
  const image = product.images[0]?.trim();
  const absoluteImage =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : image
        ? `${SITE_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`
        : `${SITE_ORIGIN}${OG_IMAGE_PATH}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    image: absoluteImage,
    description: product.specs ? Object.values(product.specs).join(", ") : product.name,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "BYN",
      url: `${SITE_ORIGIN}/product/${product.id}`,
      availability:
        product.inStock === false
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock",
    },
  };

  if (product.ratingAvg != null && product.ratingAvg > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingAvg,
      reviewCount: product.reviewCount ?? 0,
    };
  }

  return schema;
}

export function buildArticleSchema(post: { id: string; title: string; excerpt: string; createdAt?: string }) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_ORIGIN}/blog/${post.id}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
  };

  if (post.createdAt) {
    schema.datePublished = post.createdAt;
  }

  return schema;
}
