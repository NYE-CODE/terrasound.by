/** Smoke-тест сообщений ошибок загрузки чанков (логика зеркалит frontend/src/lib/lazyRoute.ts). */
function isChunkLoadError(error) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("failed to load module script") ||
    message.includes("error loading dynamically imported module")
  );
}

const cases = [
  [new TypeError("Failed to fetch dynamically imported module: /assets/Page.js"), true],
  [new TypeError("Importing a module script failed."), true],
  [new Error("network"), false],
  ["string", false],
];

for (const [error, expected] of cases) {
  const actual = isChunkLoadError(error);
  if (actual !== expected) {
    console.error("isChunkLoadError mismatch", { error, expected, actual });
    process.exit(1);
  }
}

console.log("lazyRoute self-check ok");
