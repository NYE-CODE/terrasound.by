import { ApiError } from "./api";

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
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
