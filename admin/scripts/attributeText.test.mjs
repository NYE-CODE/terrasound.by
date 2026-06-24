import assert from "node:assert/strict";

const ATTRIBUTE_TEXT_MAX_LENGTH = 255;

function attributeTextHasLineBreaks(value) {
  return value.includes("\n");
}

function clampAttributeText(value) {
  return value.slice(0, ATTRIBUTE_TEXT_MAX_LENGTH);
}

function formatAttributeTextPreview(value) {
  return value.replace(/\n+/g, " · ");
}

assert.equal(attributeTextHasLineBreaks("a\nb"), true);
assert.equal(attributeTextHasLineBreaks("ab"), false);
assert.equal(clampAttributeText("x".repeat(300)).length, 255);
assert.equal(formatAttributeTextPreview("a\nb\nc"), "a · b · c");

console.log("attributeText self-check ok");
