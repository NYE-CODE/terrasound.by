import assert from "node:assert/strict";

const COOKIE_CONSENT_ACCEPTED_VALUE = "accepted";

function isCookieConsentAccepted(storedValue) {
  return storedValue === COOKIE_CONSENT_ACCEPTED_VALUE;
}

assert.equal(isCookieConsentAccepted("accepted"), true);
assert.equal(isCookieConsentAccepted(null), false);
assert.equal(isCookieConsentAccepted(""), false);
assert.equal(isCookieConsentAccepted("rejected"), false);

console.log("cookieConsent self-check ok");
