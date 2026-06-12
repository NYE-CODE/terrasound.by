import { toast } from "sonner";
import { messageFromApiError } from "./apiError";

export function reportLoadError(
  error: unknown,
  fallback = "Не удалось загрузить данные",
): void {
  console.error(error);
  toast.error(messageFromApiError(error, fallback));
}
