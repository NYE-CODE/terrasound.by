import { readCookieConsent } from "./cookieConsent";

export const YANDEX_METRIKA_DEFAULT_ID = 110084111;

type YandexMetrikaInitOptions = {
  ssr: boolean;
  webvisor: boolean;
  clickmap: boolean;
  ecommerce: string;
  referrer: string;
  url: string;
  accurateTrackBounce: boolean;
  trackLinks: boolean;
};

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

let initialized = false;

export function getYandexMetrikaId(): number {
  const raw = import.meta.env.VITE_YANDEX_METRIKA_ID?.trim();
  const id = raw ? Number(raw) : YANDEX_METRIKA_DEFAULT_ID;
  return Number.isFinite(id) && id > 0 ? id : 0;
}

export function isYandexMetrikaInitialized(): boolean {
  return initialized;
}

function buildInitOptions(): YandexMetrikaInitOptions {
  return {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  };
}

/** Подключает счётчик Яндекс.Метрики только при принятом согласии на cookie. */
export function initYandexMetrika(): boolean {
  if (typeof window === "undefined" || initialized) return false;
  if (!readCookieConsent()) return false;

  const counterId = getYandexMetrikaId();
  if (!counterId) return false;

  initialized = true;

  const scriptUrl = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`;

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function (...args: unknown[]) {
        (m[i].a = m[i].a || []).push(args);
      };
    m[i].l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t) as HTMLScriptElement;
    a = e.getElementsByTagName(t)[0] as HTMLElement;
    k.async = true;
    k.src = r;
    a.parentNode?.insertBefore(k, a);
  })(window as Window & { [key: string]: unknown }, document, "script", scriptUrl, "ym");

  window.ym?.(counterId, "init", buildInitOptions());
  return true;
}

/** Отправляет просмотр страницы при client-side навигации (после init). */
export function trackYandexMetrikaPageView(path: string): void {
  if (!initialized || !readCookieConsent()) return;

  const counterId = getYandexMetrikaId();
  if (!counterId) return;

  window.ym?.(counterId, "hit", path, { title: document.title });
}
