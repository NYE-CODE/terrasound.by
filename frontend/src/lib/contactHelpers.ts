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

/** URL для iframe-карты (Яндекс, Google) из ссылки админки. */
export function mapEmbedUrl(raw: string, fallbackAddress?: string): string {
  const href = externalUrl(raw);
  if (!href) {
    if (fallbackAddress?.trim()) {
      return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(fallbackAddress)}&lang=ru_RU`;
    }
    return "";
  }

  try {
    const parsed = new URL(href);

    if (parsed.pathname.includes("/map-widget/")) {
      return href;
    }

    if (parsed.hostname.includes("google.") && parsed.pathname.includes("/embed")) {
      return href;
    }

    if (parsed.hostname.includes("yandex.")) {
      const text = parsed.searchParams.get("text");
      if (text) {
        return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(text)}&lang=ru_RU`;
      }

      const oid =
        parsed.searchParams.get("oid") ??
        parsed.pathname.match(/\/org\/[^/]+\/(\d+)/)?.[1] ??
        parsed.pathname.match(/\/org\/(\d+)/)?.[1];
      if (oid) {
        return `https://yandex.ru/map-widget/v1/?oid=${encodeURIComponent(oid)}&lang=ru_RU`;
      }

      const ll = parsed.searchParams.get("ll");
      if (ll) {
        return `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(ll)}&z=16&lang=ru_RU`;
      }

      const pt = parsed.searchParams.get("pt");
      if (pt) {
        return `https://yandex.ru/map-widget/v1/?pt=${encodeURIComponent(pt)}&z=16&lang=ru_RU`;
      }

      const um = parsed.searchParams.get("um");
      if (um) {
        return `https://yandex.ru/map-widget/v1/?um=${encodeURIComponent(um)}&lang=ru_RU`;
      }
    }

    if (parsed.hostname.includes("google.")) {
      const atMatch = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
      if (atMatch) {
        return `https://www.google.com/maps?q=${atMatch[1]},${atMatch[2]}&z=15&output=embed`;
      }

      const q = parsed.searchParams.get("q");
      if (q) {
        return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
      }
    }
  } catch {
    // fallback below
  }

  if (fallbackAddress?.trim()) {
    return `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(fallbackAddress)}&lang=ru_RU`;
  }

  return "";
}
