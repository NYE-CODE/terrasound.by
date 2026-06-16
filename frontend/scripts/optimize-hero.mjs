import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, "../src/assets/hero-section.webp");
const dest = path.resolve(__dirname, "../src/assets/hero-section-mobile.webp");
const MOBILE_WIDTH = 600;

if (!fs.existsSync(src)) {
  console.error("hero-section.webp not found — skip mobile variant.");
  process.exit(0);
}

const meta = await sharp(src).metadata();
const height = Math.round((meta.height / meta.width) * MOBILE_WIDTH);

await sharp(src)
  .resize(MOBILE_WIDTH, height, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(dest);

console.log(`hero-section-mobile.webp: ${MOBILE_WIDTH}x${height}`);
