/** Единый набор иконок сайта — только файлы из frontend/public/. */

export const SITE_ICONS = {
  faviconIco: "/favicon.ico",
  favicon16: "/favicon-16x16.png",
  favicon32: "/favicon-32x32.png",
  favicon48: "/favicon-48x48.png",
  appleTouch: "/apple-touch-icon.png",
  manifest: "/site.webmanifest",
  /** Для Open Graph, JSON-LD и соцсетей — не использовать как rel=icon. */
  ogImage: "/android-chrome-192x192.png",
  pwa192: "/android-chrome-192x192.png",
  pwa512: "/android-chrome-512x512.png",
};

/** HTML для index.html — одинаковый на всех prerender-страницах. */
export const FAVICON_LINKS_HTML = `
      <link rel="icon" href="${SITE_ICONS.faviconIco}" type="image/x-icon" />
      <link rel="shortcut icon" href="${SITE_ICONS.faviconIco}" type="image/x-icon" />
      <link rel="icon" type="image/png" sizes="16x16" href="${SITE_ICONS.favicon16}" />
      <link rel="icon" type="image/png" sizes="32x32" href="${SITE_ICONS.favicon32}" />
      <link rel="icon" type="image/png" sizes="48x48" href="${SITE_ICONS.favicon48}" />
      <link rel="apple-touch-icon" sizes="180x180" href="${SITE_ICONS.appleTouch}" />
      <link rel="manifest" href="${SITE_ICONS.manifest}" />`.trim();
