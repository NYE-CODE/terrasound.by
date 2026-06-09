export function resolveApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.DEV) {
    return configured || "http://localhost:8000";
  }

  if (!configured) {
    return "";
  }

  if (!configured.startsWith("https://")) {
    throw new Error("VITE_API_URL должен использовать HTTPS в production");
  }

  return configured.replace(/\/$/, "");
}
