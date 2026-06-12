import type { AttributeOption } from "./api";

export function textToOptions(value: string): AttributeOption[] {
  const used = new Set<string>();
  return splitOptionLines(value).map((line, index) => {
    const option = lineToOption(line, index);
    let nextValue = option.value;
    let suffix = 1;
    while (used.has(nextValue)) {
      nextValue = `${option.value}_${suffix}`;
      suffix += 1;
    }
    used.add(nextValue);
    return { ...option, value: nextValue };
  });
}

export function optionsToText(options: AttributeOption[] | undefined): string {
  return [...(options ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((opt) => (opt.value === opt.label ? opt.label : `${opt.value}: ${opt.label}`))
    .join("\n");
}

/** Fallback для старых атрибутов: опции enum хранились в поле unit (| или value:). */
export function optionsTextForEdit(
  options: AttributeOption[] | undefined,
  valueType: string,
  unit?: string | null,
): string {
  const fromOptions = optionsToText(options);
  if (fromOptions) return fromOptions;

  if (valueType !== "enum" && valueType !== "text") return "";

  const legacy = parseLegacyOptionsString(unit ?? "");
  if (legacy.length === 0) return "";

  return legacy
    .map((line) => line.replace(/^value\s*:\s*/i, "").trim())
    .filter(Boolean)
    .join("\n");
}

function splitOptionLines(value: string): string[] {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  if (normalized.includes("\n")) {
    return normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  }

  return parseLegacyOptionsString(normalized);
}

function parseLegacyOptionsString(raw: string): string[] {
  // До attribute_options опции enum/text лежали в unit: "a|b" или "value: x: Label".
  const text = raw.trim();
  if (!text) return [];

  if (text.includes("\n")) {
    return text.split("\n").map((line) => line.trim()).filter(Boolean);
  }

  if (text.includes("|")) {
    return text.split("|").map((part) => part.trim()).filter(Boolean);
  }

  if (/value\s*:/i.test(text)) {
    return text
      .split(/\bvalue\s*:\s*/i)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [text];
}

function lineToOption(line: string, index: number): AttributeOption {
  const cleaned = line.replace(/^value\s*:\s*/i, "").trim();
  const colon = cleaned.indexOf(":");

  if (colon > 0) {
    const code = cleaned.slice(0, colon).trim();
    const label = cleaned.slice(colon + 1).trim();
    if (code && label && !code.includes(" ") && code.replace(/_/g, "").length > 0) {
      return { value: code, label, sortOrder: index };
    }
  }

  const slug = slugFromLabel(cleaned, index);

  return { value: slug, label: cleaned, sortOrder: index };
}

function slugFromLabel(text: string, index: number): string {
  const ascii = text
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");

  if (!ascii) return `opt_${index}`;
  return ascii;
}
