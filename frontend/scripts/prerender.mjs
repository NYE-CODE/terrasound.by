import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildArticleJsonLd,
  buildLocalBusinessJsonLd,
  buildProductJsonLd,
  buildPrerenderBody,
  buildSeoHead,
  DEFAULT_CONTACT,
  escapeHtml,
  PRERENDER_BODY_STYLES,
} from "./seo-prerender.mjs";
import { buildHeroPreloadHtml, findHeroAssets } from "./hero-assets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const apiUrl = process.env.VITE_API_URL ?? process.env.PRERENDER_API_URL ?? "http://localhost:8000";
const siteOrigin = process.env.VITE_SITE_URL ?? "https://terrasound.by";

const staticRoutes = [
  {
    path: "/",
    title: "Территория звука — премиальный автозвук в Гродно",
    description: "Премиальный автозвук и профессиональная установка в Гродно.",
  },
  {
    path: "/catalogue",
    title: "Каталог | Территория звука",
    description: "Каталог премиального автозвукового оборудования в Гродно.",
  },
  {
    path: "/installation",
    title: "Услуги | Территория звука",
    description: "Профессиональная установка автозвука в Гродно.",
  },
  {
    path: "/brands",
    title: "Бренды | Территория звука",
    description: "Бренды премиального автозвука в Территории звука.",
  },
  {
    path: "/blog",
    title: "Блог | Территория звука",
    description: "Экспертные материалы об автозвуке.",
  },
  {
    path: "/delivery",
    title: "Доставка и оплата | Территория звука",
    description: "Бесплатная доставка по Гродно. Доставка по Беларуси.",
  },
  {
    path: "/about",
    title: "О нас | Территория звука",
    description: "О компании Территория звука — автозвук в Гродно.",
  },
  {
    path: "/contact",
    title: "Контакты | Территория звука",
    description: "Контакты Территории звука в Гродно.",
  },
  {
    path: "/privacy",
    title: "Политика конфиденциальности | Территория звука",
    description: "Политика конфиденциальности terrasound.by.",
  },
  {
    path: "/terms",
    title: "Условия использования | Территория звука",
    description: "Условия использования сайта terrasound.by.",
  },
];

function patchHtml(template, { title, description, canonical, headExtras = "", earlyHeadExtras = "", seoHead = "", bodyHtml = "" }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const rootInner = bodyHtml ? `\n      ${bodyHtml}\n    ` : "";

  return template
    .replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="index, follow" />`)
    .replace("<!-- lcp-preload -->", earlyHeadExtras || "")
    .replace("</head>", `${PRERENDER_BODY_STYLES}${seoHead}${headExtras}\n    </head>`)
    .replace(/<div id="root">\s*<\/div>/, `<div id="root">${rootInner}</div>`)
    .concat(`\n<!-- prerender: ${canonical} -->`);
}

function buildBootstrapHeadExtras(bootstrap) {
  if (!bootstrap) return "";

  const json = JSON.stringify(bootstrap).replace(/</g, "\\u003c");
  let extras = `\n      <script>window.__SITE_BOOTSTRAP__=${json};</script>`;

  const announcement = bootstrap.announcement;
  if (announcement?.enabled && announcement.text?.trim()) {
    extras += `\n      <style>:root{--site-announcement-height:var(--site-announcement-bar-height);}</style>`;
  }

  return extras;
}

function writeRoute(routePath, html) {
  const targetDir = routePath === "/" ? distDir : path.join(distDir, routePath.slice(1));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.json();
}

async function fetchAllProducts() {
  const products = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const page = await fetchJson(`${apiUrl}/api/v2/products?limit=${limit}&offset=${offset}`);
    const batch = page.data ?? [];
    products.push(...batch);

    const total = page.meta?.total ?? products.length;
    offset += limit;
    if (batch.length < limit || products.length >= total) {
      break;
    }
  }

  return products;
}

async function fetchAllBlogPosts() {
  const page = await fetchJson(`${apiUrl}/api/v2/blog-posts?limit=500`);
  const posts = page.data ?? [];

  return Promise.all(
    posts.map(async (post) => {
      try {
        return await fetchJson(`${apiUrl}/api/v2/blog-posts/${post.id}`);
      } catch {
        return post;
      }
    }),
  );
}

async function fetchContact() {
  try {
    return await fetchJson(`${apiUrl}/api/v2/site/settings/contact`);
  } catch {
    return DEFAULT_CONTACT;
  }
}

async function fetchLegalPages() {
  const pages = await Promise.all(
    ["privacy", "terms"].map(async (slug) => {
      try {
        return await fetchJson(`${apiUrl}/api/v2/site/settings/legal-pages/${slug}`);
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(
    pages.filter(Boolean).map((page) => [page.slug, page]),
  );
}

function buildRouteSeoHead(route, contact, localBusiness) {
  const canonical = `${siteOrigin}${route.path}`;
  const jsonLd = [{ id: "local-business", data: localBusiness }];

  if (route.product) {
    jsonLd.push({ id: "product", data: buildProductJsonLd(route.product, siteOrigin) });
  }

  if (route.post) {
    jsonLd.push({ id: "article", data: buildArticleJsonLd(route.post, siteOrigin) });
  }

  return buildSeoHead({
    title: route.title,
    description: route.description,
    canonical,
    siteOrigin,
    ogType: route.ogType ?? "website",
    ogImage: route.ogImage,
    jsonLd,
  });
}

async function main() {
  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("dist/index.html not found. Run vite build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const heroAssets = findHeroAssets(distDir);
  const heroPreload = buildHeroPreloadHtml(heroAssets);
  const routes = staticRoutes.map((route) => ({ ...route }));
  let siteBootstrap = null;
  let contact = DEFAULT_CONTACT;

  try {
    contact = await fetchContact();
  } catch {
    console.warn("Contact settings unavailable — using defaults for LocalBusiness JSON-LD.");
  }

  const localBusiness = buildLocalBusinessJsonLd(contact, siteOrigin);

  let legalPages = {};
  try {
    legalPages = await fetchLegalPages();
    for (const route of routes) {
      const slug = route.path === "/privacy" ? "privacy" : route.path === "/terms" ? "terms" : null;
      if (slug && legalPages[slug]) {
        const page = legalPages[slug];
        route.title = `${page.title} | Территория звука`;
        route.description = `${page.title} terrasound.by.`;
        route.legalPage = page;
      }
    }
  } catch {
    // legal pages optional during local build
  }

  try {
    const products = await fetchAllProducts();
    for (const product of products) {
      const ogImage =
        product.image && (product.image.startsWith("http://") || product.image.startsWith("https://"))
          ? product.image
          : product.image
            ? `${siteOrigin}${product.image.startsWith("/") ? product.image : `/${product.image}`}`
            : undefined;

      routes.push({
        path: `/product/${product.id}`,
        title: `${product.name} | Территория звука`,
        description: `${product.brand} ${product.name} — купить в Гродно.`,
        ogType: "product",
        ogImage,
        product,
      });
    }

    const posts = await fetchAllBlogPosts();
    for (const post of posts) {
      routes.push({
        path: `/blog/${post.id}`,
        title: `${post.title} | Территория звука`,
        description: post.excerpt,
        ogType: "article",
        post,
      });
    }

    console.log(`Fetched ${products.length} products and ${posts.length} blog posts for prerender.`);
  } catch (error) {
    console.warn(`API unavailable during prerender (${error.message}) — only static routes will be generated.`);
  }

  try {
    const response = await fetch(`${apiUrl}/api/v2/site/settings/announcement`);
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        siteBootstrap = data;
      }
    }
  } catch {
    // announcement bootstrap optional
  }

  const headExtras = buildBootstrapHeadExtras(
    siteBootstrap ? { announcement: siteBootstrap } : null,
  );

  for (const route of routes) {
    const canonical = `${siteOrigin}${route.path}`;
    const seoHead = buildRouteSeoHead(route, contact, localBusiness);
    const bodyHtml = buildPrerenderBody(route, siteOrigin);
    const html = patchHtml(template, {
      title: route.title,
      description: route.description,
      canonical,
      headExtras,
      earlyHeadExtras: route.path === "/" ? heroPreload : "",
      seoHead,
      bodyHtml,
    });
    writeRoute(route.path, html);
  }

  console.log(`Prerendered ${routes.length} routes.`);
}

main();
