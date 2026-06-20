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
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_TITLE,
  PRERENDER_BODY_STYLES,
  pageTitle,
  SITE_NAME,
  STATIC_PAGE_DESCRIPTIONS,
} from "./seo-prerender.mjs";
import { buildHeroPreloadHtml, findHeroAssets } from "./hero-assets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const apiUrl = process.env.VITE_API_URL ?? process.env.PRERENDER_API_URL ?? "http://localhost:8000";
const siteOrigin = process.env.VITE_SITE_URL ?? "https://terrasound.by";

const staticRoutes = [
  {
    path: "/",
    title: HOME_PAGE_TITLE,
    description: HOME_PAGE_DESCRIPTION,
  },
  {
    path: "/catalogue",
    title: pageTitle("Каталог"),
    description: STATIC_PAGE_DESCRIPTIONS.catalogue,
  },
  {
    path: "/installation",
    title: pageTitle("Услуги"),
    description: STATIC_PAGE_DESCRIPTIONS.installation,
  },
  {
    path: "/brands",
    title: pageTitle("Бренды"),
    description: STATIC_PAGE_DESCRIPTIONS.brands,
  },
  {
    path: "/blog",
    title: pageTitle("Блог"),
    description: STATIC_PAGE_DESCRIPTIONS.blog,
  },
  {
    path: "/delivery",
    title: pageTitle("Доставка и оплата"),
    description: STATIC_PAGE_DESCRIPTIONS.delivery,
  },
  {
    path: "/about",
    title: pageTitle("О нас"),
    description: STATIC_PAGE_DESCRIPTIONS.about,
  },
  {
    path: "/contact",
    title: pageTitle("Контакты"),
    description: STATIC_PAGE_DESCRIPTIONS.contact,
  },
  {
    path: "/privacy",
    title: pageTitle("Политика конфиденциальности"),
    description: STATIC_PAGE_DESCRIPTIONS.privacy,
  },
  {
    path: "/terms",
    title: pageTitle("Условия использования"),
    description: STATIC_PAGE_DESCRIPTIONS.terms,
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
        route.title = pageTitle(page.title);
        route.description = `${page.title} ${SITE_NAME} (terrasound.by).`;
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
        title: pageTitle(product.name),
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
        title: pageTitle(post.title),
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
