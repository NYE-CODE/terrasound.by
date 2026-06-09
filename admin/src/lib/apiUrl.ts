export function resolveApiUrl(): string {
  const url = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

  if (!url) {
    throw new Error("VITE_API_URL обязателен для production-сборки");
  }

  if (import.meta.env.PROD && !url.startsWith("https://")) {
    throw new Error("VITE_API_URL должен использовать HTTPS в production");
  }

  return url;
}
