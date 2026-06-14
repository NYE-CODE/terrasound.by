import { resolveApiUrl } from "./apiUrl";

/** Абсолютный URL для превью загруженных /uploads/... в админке и dev. */
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
