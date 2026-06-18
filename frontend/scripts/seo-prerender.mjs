export const SITE_NAME = "Территория звука";
export const COMPANY_NAME = "ООО «Территория звука»";
export const TAGLINE = "Премиальный автозвук и профессиональная установка в Гродно";
export const HOME_PAGE_TITLE = "Территория звука — премиальный автозвук в Гродно";
export const HOME_PAGE_DESCRIPTION =
  "Территория звука (terrasound.by) — премиальный автозвук, подбор под ваш автомобиль, профессиональная установка в Гродно.";

export const DEFAULT_CONTACT = {
  phone: "+375 33 917 7444",
  email: "info@terrasound.by",
  instagramUrl: "https://instagram.com/terrasound.by",
  tiktokUrl: "https://www.tiktok.com/@terrasound.by",
  telegramUrl: "https://t.me/terrasound_by",
  address: "г. Гродно, Озерское шоссе, 14",
  mapLat: 53.648422,
  mapLon: 23.876194,
  workingHours: "Пн–Пт, 10:00–18:00, обед 14:00–15:00",
};

const OG_IMAGE_PATH = "/android-chrome-192x192.png";

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function effectivePrice(price, salePrice) {
  if (salePrice != null && salePrice > 0 && salePrice < price) return salePrice;
  return price;
}

export function buildLocalBusinessJsonLd(contact, siteOrigin) {
  const sameAs = [contact.instagramUrl, contact.tiktokUrl, contact.telegramUrl].filter(
    (url) => typeof url === "string" && url.trim().length > 0,
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    legalName: COMPANY_NAME,
    description: TAGLINE,
    url: siteOrigin,
    image: `${siteOrigin}${OG_IMAGE_PATH}`,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Гродно",
      addressCountry: "BY",
      streetAddress: contact.address,
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

  if (contact.mapLat != null && contact.mapLon != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: contact.mapLat,
      longitude: contact.mapLon,
    };
  }

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (contact.workingHours?.trim()) {
    schema.description = `${TAGLINE} Режим работы: ${contact.workingHours.trim()}.`;
  }

  return schema;
}

export function buildProductJsonLd(product, siteOrigin) {
  const price = effectivePrice(product.price, product.salePrice);
  const image = product.image?.trim() || product.images?.[0]?.trim();
  const absoluteImage =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : image
        ? `${siteOrigin}${image.startsWith("/") ? image : `/${image}`}`
        : `${siteOrigin}${OG_IMAGE_PATH}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    image: absoluteImage,
    description: product.specs?.trim() || product.name,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "BYN",
      url: `${siteOrigin}/product/${product.id}`,
      availability: product.inStock === false ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
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

export function buildArticleJsonLd(post, siteOrigin) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${siteOrigin}/blog/${post.id}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteOrigin,
    },
  };

  if (post.createdAt) {
    schema.datePublished = post.createdAt;
  }

  return schema;
}

export function jsonLdScriptTag(id, data) {
  return `<script id="jsonld-${id}" type="application/ld+json">${escapeJsonForScript(data)}</script>`;
}

export function buildSeoHead({
  title,
  description,
  canonical,
  siteOrigin,
  ogType = "website",
  ogImage,
  jsonLd = [],
}) {
  const image = ogImage ?? `${siteOrigin}${OG_IMAGE_PATH}`;
  const lines = [
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];

  for (const block of jsonLd) {
    lines.push(jsonLdScriptTag(block.id, block.data));
  }

  return `\n      ${lines.join("\n      ")}\n`;
}

export const PRERENDER_BODY_STYLES = `<style id="ssg-prerender-style">
#ssg-prerender{box-sizing:border-box;max-width:48rem;margin:0 auto;padding:1.5rem 1rem;font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#e8e8e8;background:#0e0e0f}
#ssg-prerender h1{font-size:1.75rem;line-height:1.2;margin:0 0 .75rem;font-weight:700}
#ssg-prerender p{margin:0 0 .75rem}
#ssg-prerender img{display:block;max-width:100%;height:auto;margin:0 0 1rem;border-radius:.5rem}
#ssg-prerender .ssg-muted{opacity:.75;font-size:.875rem}
#ssg-prerender .ssg-price{font-size:1.25rem;font-weight:700}
#ssg-prerender .ssg-lead{font-size:1.05rem;opacity:.9}
#ssg-prerender .ssg-legal-sections section+section{margin-top:1.5rem}
#ssg-prerender .ssg-legal-sections h2{font-size:1.35rem;line-height:1.25;margin:0 0 .75rem;font-weight:700}
</style>`;

function absoluteAssetUrl(value, siteOrigin) {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${siteOrigin}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function staticPageHeading(title) {
  const separator = title.indexOf(" | ");
  return separator >= 0 ? title.slice(0, separator) : title;
}

function formatPrice(price) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2).replace(/\.00$/, "");
}

export function buildStaticPrerenderBody(route) {
  if (route.legalPage) {
    return buildLegalPrerenderBody(route.legalPage);
  }

  return `<main id="ssg-prerender" data-prerender="page">
    <h1>${escapeHtml(staticPageHeading(route.title))}</h1>
    <p class="ssg-lead">${escapeHtml(route.description)}</p>
  </main>`;
}

export function buildLegalPrerenderBody(page) {
  const sections = page.content
    .split(/\n(?=## )/)
    .map((block) => block.trim())
    .filter(Boolean);

  const sectionsHtml = sections
    .map((block) => {
      if (!block.startsWith("## ")) {
        return `<p class="ssg-lead">${escapeHtml(block)}</p>`;
      }

      const newlineIndex = block.indexOf("\n");
      const heading = newlineIndex === -1 ? block.slice(3).trim() : block.slice(3, newlineIndex).trim();
      const body = newlineIndex === -1 ? "" : block.slice(newlineIndex + 1).trim();
      const paragraphs = body
        .split(/\n{2,}/)
        .flatMap((chunk) => chunk.split("\n"))
        .map((line) => line.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("");

      return `<section><h2>${escapeHtml(heading)}</h2>${paragraphs}</section>`;
    })
    .join("");

  return `<main id="ssg-prerender" data-prerender="legal">
    <h1>${escapeHtml(page.title)}</h1>
    <div class="ssg-legal-sections">${sectionsHtml}</div>
  </main>`;
}

export function buildProductPrerenderBody(product, siteOrigin) {
  const price = effectivePrice(product.price, product.salePrice);
  const availability = product.inStock === false ? "Под заказ" : "В наличии";
  const imageUrl = absoluteAssetUrl(product.image || product.images?.[0], siteOrigin);
  const specs = typeof product.specs === "string" ? product.specs.trim() : "";

  return `<main id="ssg-prerender" data-prerender="product">
    <p class="ssg-muted">${escapeHtml(product.brand)}</p>
    <h1>${escapeHtml(product.name)}</h1>
    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" width="640" height="640" loading="eager" decoding="async" />` : ""}
    <p><span class="ssg-price">${escapeHtml(formatPrice(price))} BYN</span> · ${escapeHtml(availability)}</p>
    ${specs ? `<p>${escapeHtml(specs)}</p>` : ""}
  </main>`;
}

export function buildArticlePrerenderBody(post) {
  const paragraphs = (post.content || post.excerpt || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  return `<main id="ssg-prerender" data-prerender="article">
    ${post.category ? `<p class="ssg-muted">${escapeHtml(post.category)}</p>` : ""}
    <h1>${escapeHtml(post.title)}</h1>
    <p class="ssg-lead">${escapeHtml(post.excerpt)}</p>
    <div>${paragraphs}</div>
  </main>`;
}

export function buildPrerenderBody(route, siteOrigin) {
  if (route.product) {
    return buildProductPrerenderBody(route.product, siteOrigin);
  }
  if (route.post) {
    return buildArticlePrerenderBody(route.post);
  }
  return buildStaticPrerenderBody(route);
}
