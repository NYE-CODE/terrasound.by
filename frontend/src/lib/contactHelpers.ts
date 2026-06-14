/** Абсолютный URL для внешней ссылки (добавляет https:// при необходимости). */
export function externalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function socialHandle(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const segment = parsed.pathname.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? "";
    if (!segment) return trimmed;
    return segment.startsWith("@") ? segment : `@${segment}`;
  } catch {
    return trimmed;
  }
}
