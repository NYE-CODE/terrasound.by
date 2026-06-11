const RU_CONSONANT = /[бвгджзйклмнпрстфхцчшщ]/i;

/**
 * Сокращает слово на ближайшей согласной с точкой.
 * Срабатывает только если слово длиннее triggerLength; целевая длина — targetLength.
 */
export function abbreviateAtConsonant(
  text: string,
  triggerLength = 10,
  targetLength = 8,
): string {
  const trimmed = text.trim();
  if (trimmed.length <= triggerLength) return trimmed;

  for (let i = Math.min(trimmed.length - 1, targetLength); i >= 2; i--) {
    if (RU_CONSONANT.test(trimmed[i])) {
      const abbreviated = `${trimmed.slice(0, i + 1)}.`;
      // Не сокращаем, если выигрыш меньше 2 символов — точка вместо буквы выглядит странно.
      if (trimmed.length - abbreviated.length < 2) return trimmed;
      return abbreviated;
    }
  }

  const fallback = `${trimmed.slice(0, targetLength)}.`;
  if (trimmed.length - fallback.length < 2) return trimmed;
  return fallback;
}

/** Сокращает каждое длинное слово в строке (пробелы сохраняются). */
export function abbreviateLongWords(name: string, triggerLength = 10, targetLength = 8): string {
  return name
    .split(/(\s+)/)
    .map((part) =>
      /\s+/.test(part) ? part : abbreviateAtConsonant(part, triggerLength, targetLength),
    )
    .join("");
}
