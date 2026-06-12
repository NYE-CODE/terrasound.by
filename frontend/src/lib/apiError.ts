export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: "Некорректные данные. Проверьте форму и попробуйте снова.",
  404: "Данные не найдены. Обновите страницу.",
  409: "Операция невозможна из-за конфликта данных.",
  422: "Некорректные данные запроса.",
  429: "Слишком много запросов. Попробуйте позже.",
};

function parseApiDetail(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  return null;
}

/** Сообщение для пользователя из ошибки API (без утечки 500). */
export function messageFromApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) return fallback;
    if (error.message !== "Ошибка запроса") return error.message;
    return STATUS_FALLBACKS[error.status] ?? fallback;
  }
  return fallback;
}

export function parseApiErrorBody(body: unknown, status: number): ApiError {
  const detail = parseApiDetail(body) ?? "Ошибка запроса";
  return new ApiError(detail, status);
}
