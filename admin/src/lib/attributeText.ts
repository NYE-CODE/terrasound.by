/** Лимит колонки product_attribute_values.value_string в БД. */
export const ATTRIBUTE_TEXT_MAX_LENGTH = 255;

export function attributeTextHasLineBreaks(value: string): boolean {
  return value.includes("\n");
}

export function clampAttributeText(value: string): string {
  return value.slice(0, ATTRIBUTE_TEXT_MAX_LENGTH);
}

/** Однострочный preview для основного поля, когда в значении есть переносы. */
export function formatAttributeTextPreview(value: string): string {
  return value.replace(/\n+/g, " · ");
}
