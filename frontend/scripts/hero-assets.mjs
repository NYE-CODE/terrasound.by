import fs from "fs";
import path from "path";

export const HERO_DESKTOP_WIDTH = 1024;
export const HERO_MOBILE_WIDTH = 600;

export function findHeroAssets(distDir) {
  const assetsDir = path.join(distDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    return null;
  }

  const files = fs.readdirSync(assetsDir);
  const desktopFile = files.find(
    (name) => /^hero-section-[A-Za-z0-9_-]+\.webp$/.test(name) && !name.includes("-mobile-"),
  );
  const mobileFile = files.find((name) => /^hero-section-mobile-[A-Za-z0-9_-]+\.webp$/.test(name));

  if (!desktopFile) {
    return null;
  }

  const desktop = `/assets/${desktopFile}`;
  const mobile = mobileFile ? `/assets/${mobileFile}` : desktop;

  return { desktop, mobile };
}

export function buildHeroPreloadHtml(assets) {
  if (!assets) {
    return "";
  }

  const srcset =
    assets.mobile !== assets.desktop
      ? `${assets.mobile} ${HERO_MOBILE_WIDTH}w, ${assets.desktop} ${HERO_DESKTOP_WIDTH}w`
      : `${assets.desktop} ${HERO_DESKTOP_WIDTH}w`;
  const sizes = "(max-width: 1023px) 100vw, 50vw";

  return `\n      <link rel="preload" as="image" type="image/webp" href="${assets.mobile}" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high" />`;
}
