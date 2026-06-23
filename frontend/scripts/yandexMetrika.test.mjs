import assert from "node:assert/strict";

const YANDEX_METRIKA_DEFAULT_ID = 110084111;

function getYandexMetrikaId(raw) {
  const id = raw ? Number(raw) : YANDEX_METRIKA_DEFAULT_ID;
  return Number.isFinite(id) && id > 0 ? id : 0;
}

assert.equal(getYandexMetrikaId(undefined), 110084111);
assert.equal(getYandexMetrikaId("110084111"), 110084111);
assert.equal(getYandexMetrikaId(""), 110084111);
assert.equal(getYandexMetrikaId("0"), 0);
assert.equal(getYandexMetrikaId("invalid"), 0);

console.log("yandexMetrika self-check ok");
