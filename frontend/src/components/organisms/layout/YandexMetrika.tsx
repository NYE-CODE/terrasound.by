import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { COOKIE_CONSENT_ACCEPTED_EVENT, readCookieConsent } from "../../../lib/cookieConsent";
import { initYandexMetrika, trackYandexMetrikaPageView } from "../../../lib/yandexMetrika";

function buildPagePath(pathname: string, search: string, hash: string): string {
  return `${pathname}${search}${hash}`;
}

export function YandexMetrika() {
  const location = useLocation();
  const skipNextHit = useRef(true);

  useEffect(() => {
    const tryInit = () => {
      if (readCookieConsent()) initYandexMetrika();
    };

    tryInit();
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, tryInit);
    return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, tryInit);
  }, []);

  useEffect(() => {
    if (!readCookieConsent()) return;

    const path = buildPagePath(location.pathname, location.search, location.hash);
    if (skipNextHit.current) {
      skipNextHit.current = false;
      return;
    }

    trackYandexMetrikaPageView(path);
  }, [location.pathname, location.search, location.hash]);

  return null;
}
