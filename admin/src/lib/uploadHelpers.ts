export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "10 МБ";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".0", "")} МБ`;
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Допустимы только JPEG, PNG и WebP.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Файл «${file.name}» слишком большой (${formatFileSize(file.size)}). Максимум ${MAX_UPLOAD_LABEL}.`;
  }
  return null;
}

function parseApiDetail(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;

  if ("detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (first && typeof first === "object" && "msg" in first) {
        const msg = (first as { msg?: unknown }).msg;
        if (typeof msg === "string" && msg.trim()) return msg;
      }
    }
  }

  if ("title" in body && typeof (body as { title?: unknown }).title === "string") {
    const title = (body as { title: string }).title.trim();
    if (title) return title;
  }

  return null;
}

export function parseUploadError(response: Response, payload: unknown): string {
  const fromBody = parseApiDetail(payload);
  if (fromBody) return fromBody;

  switch (response.status) {
    case 413:
      return `Файл слишком большой. Максимум ${MAX_UPLOAD_LABEL} (JPEG, PNG или WebP).`;
    case 400:
      return "Некорректный файл. Допустимы только JPEG, PNG и WebP.";
    case 401:
      return "Сессия истекла. Войдите в админку снова.";
    case 429:
      return "Слишком много запросов. Подождите и попробуйте снова.";
    default:
      return `Не удалось загрузить файл (ошибка ${response.status}).`;
  }
}
