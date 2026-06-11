export const FILTER_TYPE_LABELS: Record<string, string> = {
  checkbox: "Галочка (да/нет)",
  multiselect: "Список с галочками",
  dropdown: "Выпадающий список",
  range: "Ползунок «до…»",
};

export const VALUE_TYPE_LABELS: Record<string, string> = {
  text: "Текст",
  number: "Число",
  boolean: "Да / нет",
  enum: "Список вариантов",
};

export function defaultFilterType(valueType: string, optionCount = 0): string | null {
  if (valueType === "boolean") return "checkbox";
  if (valueType === "number") return "range";
  if (valueType === "enum") return optionCount <= 12 ? "multiselect" : "dropdown";
  return null;
}

export function allowedFilterTypes(valueType: string): string[] {
  if (valueType === "boolean") return ["checkbox"];
  if (valueType === "number") return ["range"];
  if (valueType === "enum") return ["multiselect", "dropdown"];
  return [];
}

export function filterTypeHint(valueType: string): string {
  switch (valueType) {
    case "boolean":
      return "В каталоге — одна галочка («Есть Bluetooth»). Задаётся автоматически.";
    case "number":
      return "В каталоге — ползунок «до N». Диапазон min/max настраивается в категории.";
    case "enum":
      return "Список с галочками — как бренд или тип на Ozon (можно выбрать несколько). Выпадающий — если вариантов много.";
    default:
      return "Текстовые атрибуты в фильтрах каталога не используются.";
  }
}
