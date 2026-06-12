export const SITE_NAME = "TerraSound";
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
  address: "г. Гродно, Озерское шоссе, 14",
  phoneTel: "+375339177444",
  addressMapsUrl: `https://yandex.by/maps/?text=${encodeURIComponent("г. Гродно, Озерское шоссе, 14, Беларусь")}`,
};
