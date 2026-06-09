import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const apiUrl = process.env.VITE_API_URL ?? "http://localhost:8000";
const siteOrigin = process.env.VITE_SITE_URL ?? "https://terrasound.by";

const staticRoutes = [
  { path: "/", title: "TerraSound — премиальный автозвук в Гродно", description: "Премиальный автозвук и профессиональная установка в Гродно." },
  { path: "/catalogue", title: "Каталог | TerraSound", description: "Каталог премиального автозвукового оборудования в Гродно." },
  { path: "/installation", title: "Установка | TerraSound", description: "Профессиональная установка автозвука в Гродно." },
  { path: "/brands", title: "Бренды | TerraSound", description: "Бренды премиального автозвука в TerraSound." },
  { path: "/blog", title: "Блог | TerraSound", description: "Экспертные материалы об автозвуке." },
  { path: "/delivery", title: "Доставка и оплата | TerraSound", description: "Бесплатная доставка по Гродно. Доставка по Беларуси." },
  { path: "/about", title: "О нас | TerraSound", description: "О компании TerraSound — автозвук в Гродно." },
  { path: "/contact", title: "Контакты | TerraSound", description: "Контакты TerraSound в Гродно." },
];

function patchHtml(template, { title, description, canonical }) {
  return template
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="index, follow" />`)
    .concat(`\n<!-- prerender: ${canonical} -->`);
}

function writeRoute(routePath, html) {
  const targetDir = routePath === "/" ? distDir : path.join(distDir, routePath.slice(1));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
}

async function main() {
  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("dist/index.html not found. Run vite build first.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const routes = [...staticRoutes];

  try {
    const productList = await fetchJson(`${apiUrl}/api/products`);
    const products = Array.isArray(productList) ? productList : productList.items ?? [];
    for (const product of products) {
      routes.push({
        path: `/product/${product.id}`,
        title: `${product.name} | TerraSound`,
        description: `${product.brand} ${product.name} — купить в Гродно.`,
      });
    }

    const posts = await fetchJson(`${apiUrl}/api/blog`);
    for (const post of posts) {
      routes.push({
        path: `/blog/${post.id}`,
        title: `${post.title} | TerraSound`,
        description: post.excerpt,
      });
    }
  } catch {
    console.warn("API unavailable during prerender — only static routes will be generated.");
  }

  for (const route of routes) {
    const html = patchHtml(template, {
      title: route.title,
      description: route.description,
      canonical: `${siteOrigin}${route.path}`,
    });
    writeRoute(route.path, html);
  }

  console.log(`Prerendered ${routes.length} routes.`);
}

main();
