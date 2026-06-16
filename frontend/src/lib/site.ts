export const SITE_NAME = "Территория звука";
export const SITE_SUBTITLE = "Территория звука";
export const SITE_BRAND_TITLE = "ТЕРРИТОРИЯ ЗВУКА";
export const SITE_BRAND_TAGLINE = "АВТОМОБИЛЬНЫЕ АУДИОСИСТЕМЫ";
export const SITE_URL = "terrasound.by";
export const SITE_ORIGIN = import.meta.env.VITE_SITE_URL ?? "https://terrasound.by";
export const COMPANY_NAME = 'ООО «Территория звука»';
export const WORKING_HOURS = "Пн–Пт, 10:00–18:00, обед 14:00–15:00";
export const TAGLINE = "Премиальный автозвук и профессиональная установка в Гродно";

/** Значения по умолчанию до загрузки из API (и fallback при ошибке сети). */
export const DEFAULT_SITE_CONTACT = {
  phone: "+375 33 917 7444",
  email: "info@terrasound.by",
  instagramUrl: "https://instagram.com/terrasound.by",
  tiktokUrl: "https://www.tiktok.com/@terrasound.by",
  telegramUrl: "https://t.me/terrasound_by",
  address: "г. Гродно, Озерское шоссе, 14",
  phoneTel: "+375339177444",
  mapLat: 53.648422,
  mapLon: 23.876194,
  addressMapsUrl: "https://yandex.by/maps/?pt=23.876194,53.648422&z=17&l=map",
  mapEmbedUrl:
    "https://yandex.ru/map-widget/v1/?ll=23.876194,53.648422&z=17&pt=23.876194,53.648422&lang=ru_RU",
  workingHours: WORKING_HOURS,
};
