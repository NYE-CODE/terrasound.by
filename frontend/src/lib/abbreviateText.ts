const RU_CONSONANT = /[бвгджзйклмнпрстфхцчшщ]/i;

/** Сокращает слово на ближайшей согласной с точкой, если оно длиннее maxLength. */
export function abbreviateAtConsonant(text: string, maxLength = 8): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  for (let i = Math.min(trimmed.length - 1, maxLength); i >= 2; i--) {
    if (RU_CONSONANT.test(trimmed[i])) {
      return `${trimmed.slice(0, i + 1)}.`;
    }
  }

  return `${trimmed.slice(0, maxLength)}.`;
}

/** Сокращает каждое длинное слово в строке (пробелы сохраняются). */
export function abbreviateLongWords(name: string, maxWordLength = 8): string {
  return name
    .split(/(\s+)/)
    .map((part) => (/\s+/.test(part) ? part : abbreviateAtConsonant(part, maxWordLength)))
    .join("");
}
