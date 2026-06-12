export function resolveApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.DEV) {
    return configured || "http://localhost:8000";
  }

  // Production: пустой VITE_API_URL — относительные пути /api/v1/... через nginx admin.terrasound.by.
  if (!configured) {
    return "";
  }

  if (!configured.startsWith("https://")) {
    throw new Error("VITE_API_URL должен использовать HTTPS в production");
  }

  return configured.replace(/\/$/, "");
}
