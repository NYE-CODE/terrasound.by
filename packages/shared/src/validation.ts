export const PHONE_INPUT_PLACEHOLDER = "+375339177444";

const PHONE_PATTERN = /^(\+\d{10,12}|\d{11,13})$/;
const PHONE_LETTERS_PATTERN = /[A-Za-zА-Яа-яЁё]/u;
const PHONE_ALLOWED_CHARS_PATTERN = /^[\d+\s\-()]+$/;
const PERSON_NAME_PATTERN = /^[A-Za-zА-Яа-яЁё]+(?:[ \-][A-Za-zА-Яа-яЁё]+)*$/u;
const CAR_MODEL_PATTERN = /^[A-Za-zА-Яа-яЁё0-9.\- ]+$/u;

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function normalizePersonName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeCarModel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validatePhone(raw: string): ValidationResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, error: "Укажите телефон" };
  }

  if (PHONE_LETTERS_PATTERN.test(trimmed)) {
    return { ok: false, error: "В номере не должно быть букв" };
  }

  if (!PHONE_ALLOWED_CHARS_PATTERN.test(trimmed)) {
    return { ok: false, error: "Неверный формат телефона" };
  }

  const plusCount = (trimmed.match(/\+/g) ?? []).length;
  if (plusCount > 1 || (plusCount === 1 && !trimmed.startsWith("+"))) {
    return { ok: false, error: "«+» только в начале номера" };
  }

  const normalized = normalizePhone(trimmed);
  const digitCount = normalized.replace(/\D/g, "").length;

  if (digitCount < 11) {
    return { ok: false, error: "Номер слишком короткий" };
  }

  if (digitCount > 13) {
    return { ok: false, error: "Номер слишком длинный" };
  }

  if (!PHONE_PATTERN.test(normalized)) {
    return { ok: false, error: "Неверный формат телефона" };
  }

  return { ok: true, value: normalized };
}

export function validatePersonName(raw: string): ValidationResult {
  const normalized = normalizePersonName(raw);

  if (!normalized) {
    return { ok: false, error: "Укажите имя" };
  }

  if (normalized.length < 2) {
    return { ok: false, error: "Минимум 2 символа" };
  }

  if (normalized.length > 100) {
    return { ok: false, error: "Слишком длинное имя" };
  }

  if (/\d/.test(normalized)) {
    return { ok: false, error: "Имя не может содержать цифры" };
  }

  if (!PERSON_NAME_PATTERN.test(normalized)) {
    return { ok: false, error: "Только буквы, пробел и дефис" };
  }

  return { ok: true, value: normalized };
}

export function validateCarModel(raw: string): ValidationResult {
  const normalized = normalizeCarModel(raw);

  if (!normalized) {
    return { ok: false, error: "Укажите модель авто" };
  }

  if (normalized.length < 2) {
    return { ok: false, error: "Минимум 2 символа" };
  }

  if (normalized.length > 100) {
    return { ok: false, error: "Слишком длинная модель" };
  }

  if (!CAR_MODEL_PATTERN.test(normalized)) {
    return { ok: false, error: "Недопустимые символы в модели" };
  }

  if (/\s{2,}/.test(raw.trim())) {
    return { ok: false, error: "Уберите лишние пробелы" };
  }

  if (!/[A-Za-zА-Яа-яЁё]/u.test(normalized)) {
    return { ok: false, error: "Пример: BMW 5 Series" };
  }

  return { ok: true, value: normalized };
}

export function validateOptionalCarModel(raw: string): ValidationResult {
  const normalized = normalizeCarModel(raw);
  if (!normalized) {
    return { ok: true, value: "" };
  }
  return validateCarModel(normalized);
}
