export const STRONG_PASSWORD_MIN_LENGTH = 12;
export const STRONG_PASSWORD_HINT =
  "Не короче 12 символов: строчные и заглавные буквы, цифра и спецсимвол";

export function validateStrongPassword(password: string): string | null {
  if (password.length < STRONG_PASSWORD_MIN_LENGTH) {
    return STRONG_PASSWORD_HINT;
  }
  if (!/[a-z]/.test(password)) {
    return STRONG_PASSWORD_HINT;
  }
  if (!/[A-Z]/.test(password)) {
    return STRONG_PASSWORD_HINT;
  }
  if (!/\d/.test(password)) {
    return STRONG_PASSWORD_HINT;
  }
  if (!/[^\w\s]/.test(password)) {
    return STRONG_PASSWORD_HINT;
  }
  return null;
}
