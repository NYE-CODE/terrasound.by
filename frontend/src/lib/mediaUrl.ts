import { resolveApiUrl } from "./apiUrl";

/** Абсолютный URL для /uploads/... (dev: бэкенд; prod: тот же домен). */
export function resolveMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/uploads/")) {
    const base = resolveApiUrl() || window.location.origin;
    return `${base.replace(/\/$/, "")}${trimmed}`;
  }
  return trimmed;
}
