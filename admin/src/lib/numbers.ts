/** Парсинг необязательного числа из input type="number". */
export function parseOptionalNumber(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** Парсинг обязательного целого; при невалидном вводе — fallback. */
export function parseRequiredInt(raw: string, fallback: number): number {
  const text = raw.trim();
  if (!text) return fallback;
  const value = Number(text);
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

/** Нормализация min/max ползунка; при lo === hi расширяем max — иначе range в UI нулевой. */
export function normalizeFilterRange(
  min: number | null | undefined,
  max: number | null | undefined,
): { filterMin: number | null; filterMax: number | null } {
  const lo = min ?? null;
  const hi = max ?? null;
  if (lo == null || hi == null) {
    return { filterMin: lo, filterMax: hi };
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return {
      filterMin: Number.isFinite(lo) ? lo : null,
      filterMax: Number.isFinite(hi) ? hi : null,
    };
  }
  if (lo > hi) return { filterMin: hi, filterMax: lo };
  if (lo === hi) return { filterMin: lo, filterMax: hi + 1 };
  return { filterMin: lo, filterMax: hi };
}
