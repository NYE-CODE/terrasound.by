export const COOKIE_CONSENT_STORAGE_KEY = "terrasound-cookie-consent";
export const COOKIE_CONSENT_ACCEPTED_VALUE = "accepted";
export const COOKIE_CONSENT_ACCEPTED_EVENT = "terrasound-cookie-consent-accepted";

/** Принято ли согласие на использование cookie (только client-side). */
export function isCookieConsentAccepted(storedValue: string | null): boolean {
  return storedValue === COOKIE_CONSENT_ACCEPTED_VALUE;
}

export function readCookieConsent(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return isCookieConsentAccepted(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function acceptCookieConsent(): void {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_ACCEPTED_VALUE);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_ACCEPTED_EVENT));
}
