import { messageFromApiError } from "./apiError";
import { toastError } from "./lazyToast";

export function reportLoadError(
  error: unknown,
  fallback = "Не удалось загрузить данные",
): void {
  console.error(error);
  void toastError(messageFromApiError(error, fallback));
}
