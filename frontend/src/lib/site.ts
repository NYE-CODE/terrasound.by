export const SITE_NAME = "Территория звука";
export const SITE_SUBTITLE = "Территория звука";
export const SITE_BRAND_TITLE = "ТЕРРИТОРИЯ ЗВУКА";
export const SITE_BRAND_TAGLINE = "АВТОМОБИЛЬНЫЕ АУДИОСИСТЕМЫ";
export const SITE_URL = "terrasound.by";
export const SITE_ORIGIN = import.meta.env.VITE_SITE_URL ?? "https://terrasound.by";
export const COMPANY_NAME = 'ООО «Территория звука»';
export const WORKING_HOURS = "Пн–Пт, 10:00–18:00, обед 14:00–15:00";
export const TAGLINE = "Премиальный автозвук и профессиональная установка в Гродно";
export const HOME_PAGE_TITLE = "Территория звука — премиальный автозвук в Гродно";
export const HOME_PAGE_DESCRIPTION =
  "Территория звука (terrasound.by) — премиальный автозвук, подбор под ваш автомобиль, профессиональная установка в Гродно.";

/** Пути к иконкам — только frontend/public/. ogImage не использовать как favicon вкладки. */
export const SITE_ICONS = {
  faviconIco: "/favicon.ico",
  favicon16: "/favicon-16x16.png",
  favicon32: "/favicon-32x32.png",
  favicon48: "/favicon-48x48.png",
  appleTouch: "/apple-touch-icon.png",
  manifest: "/site.webmanifest",
  ogImage: "/android-chrome-192x192.png",
} as const;

export function pageTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

/** Meta description для статических страниц (prerender + SPA). */
export const STATIC_PAGE_DESCRIPTIONS = {
  catalogue:
    "Каталог премиального автозвукового оборудования в Гродно. Акустика, сабвуферы, усилители, установка.",
  installation: "Подбор, установка и настройка акустических систем в Гродно.",
  brands: `Бренды премиального автозвука, с которыми работает ${SITE_NAME} в Гродно.`,
  blog: `Полезные советы и статьи об автозвуке от ${SITE_NAME} в Гродно.`,
  delivery: `Бесплатная доставка по Гродно. Доставка автозвукового оборудования по Беларуси. Условия оплаты ${SITE_NAME}.`,
  about: `О компании ${SITE_NAME} — премиальный автозвук и профессиональная установка в Гродно.`,
  contact: `Телефон, email, адрес студии и режим работы. ${SITE_NAME}, Гродно.`,
  privacy: `Политика конфиденциальности ${SITE_NAME} (terrasound.by).`,
  terms: `Условия использования сайта ${SITE_NAME} (terrasound.by).`,
} as const;

/** Значения по умолчанию до загрузки из API (и fallback при ошибке сети). */
export const DEFAULT_SITE_CONTACT = {
  phone: "+375 33 917 7444",
  email: "info@terrasound.by",
  instagramUrl: "https://instagram.com/terrasound.by",
  tiktokUrl: "https://www.tiktok.com/@terrasound.by",
  telegramUrl: "https://t.me/terrasound_by",
  address: "г. Гродно, Озерское шоссе, 14",
  phoneTel: "+375339177444",
  mapsUrl: "https://yandex.by/maps/?mode=routes&rtext=~53.648422,23.876194&rtt=auto",
  mapLat: 53.648422,
  mapLon: 23.876194,
  addressMapsUrl: "https://yandex.by/maps/?mode=routes&rtext=~53.648422,23.876194&rtt=auto",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=23.876194,53.648422&z=17&pt=23.876194,53.648422&lang=ru_RU",
  workingHours: WORKING_HOURS,
};
