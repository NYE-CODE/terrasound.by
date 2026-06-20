import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FAVICON_LINKS_HTML,
  SITE_ICONS,
} from "./site-icons.mjs";
import {
  SITE_NAME,
  STATIC_PAGE_DESCRIPTIONS,
  pageTitle,
} from "./seo-prerender.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");

assert.doesNotMatch(indexHtml, /\bTerraSound\b/);
assert.doesNotMatch(indexHtml, /android-chrome-192x192\.png" \/>/);
assert.match(indexHtml, /favicon-16x16\.png/);
assert.match(indexHtml, /favicon-32x32\.png/);
assert.doesNotMatch(FAVICON_LINKS_HTML, /android-chrome/);

for (const value of Object.values(SITE_ICONS)) {
  assert.match(value, /^\/[a-z0-9./_-]+$/i);
  if (value.endsWith(".png") || value.endsWith(".ico") || value.endsWith(".webmanifest")) {
    const filePath = path.resolve(__dirname, "../public", value.slice(1));
    assert.ok(fs.existsSync(filePath), `missing public asset: ${value}`);
  }
}

assert.equal(SITE_NAME, "Территория звука");
assert.match(pageTitle("Каталог"), /Территория звука$/);
assert.doesNotMatch(JSON.stringify(STATIC_PAGE_DESCRIPTIONS), /\bTerraSound\b/);

console.log("seo-consistency.test.mjs: ok");
