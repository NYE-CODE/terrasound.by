export const PHONE_INPUT_PLACEHOLDER = "+375339177444";

const PHONE_PATTERN = /^(\+\d{10,12}|\d{11,13})$/;
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
  const normalized = normalizePhone(raw);

  if (!normalized) {
    return { ok: false, error: "Укажите телефон" };
  }

  if (!PHONE_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "Телефон: только цифры и «+» в начале, 11–13 символов без пробелов",
    };
  }

  return { ok: true, value: normalized };
}

export function validatePersonName(raw: string): ValidationResult {
  const normalized = normalizePersonName(raw);

  if (!normalized) {
    return { ok: false, error: "Укажите имя" };
  }

  if (normalized.length < 2) {
    return { ok: false, error: "Имя должно содержать минимум 2 символа" };
  }

  if (normalized.length > 100) {
    return { ok: false, error: "Имя не должно превышать 100 символов" };
  }

  if (!PERSON_NAME_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "Имя: только буквы (латиница или кириллица), пробел и дефис",
    };
  }

  return { ok: true, value: normalized };
}

export function validateCarModel(raw: string): ValidationResult {
  const normalized = normalizeCarModel(raw);

  if (!normalized) {
    return { ok: false, error: "Укажите модель автомобиля" };
  }

  if (normalized.length < 2) {
    return { ok: false, error: "Модель должна содержать минимум 2 символа" };
  }

  if (normalized.length > 100) {
    return { ok: false, error: "Модель не должна превышать 100 символов" };
  }

  if (!CAR_MODEL_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "Модель: буквы, цифры, пробел, дефис и точка",
    };
  }

  if (/\s{2,}/.test(raw.trim())) {
    return { ok: false, error: "Не более одного пробела подряд" };
  }

  if (!/[A-Za-zА-Яа-яЁё]/u.test(normalized)) {
    return { ok: false, error: "Укажите модель, например BMW 5 Series 2020 или БМВ 5" };
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
