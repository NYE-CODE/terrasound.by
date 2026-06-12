import { ApiError } from "./api";

const STATUS_FALLBACKS: Record<number, string> = {
  409: "Операция невозможна: запись связана с другими данными или уже существует.",
  400: "Некорректные данные. Проверьте форму и попробуйте снова.",
  404: "Запись не найдена. Обновите страницу и попробуйте снова.",
  422: "Некорректные данные запроса.",
};

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.message !== "Ошибка запроса") return error.message;
    return STATUS_FALLBACKS[error.status] ?? fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function reportFormError(error: unknown, fallback = "Не удалось сохранить. Проверьте данные и попробуйте снова.") {
  console.error(error);
  alert(messageFromError(error, fallback));
}

export function reportActionError(error: unknown, fallback = "Не удалось выполнить операцию.") {
  reportFormError(error, fallback);
}

export function reportLoadError(
  error: unknown,
  fallback = "Не удалось загрузить данные. Обновите страницу или попробуйте позже.",
) {
  console.error(error);
  alert(messageFromError(error, fallback));
}
