import { useRef, useState } from "react";
import { FormField } from "./FormField";
import { resolveMediaUrl } from "../lib/mediaUrl";
import { validateUploadFile } from "../lib/uploadHelpers";

interface ImageUploadFieldProps {
  label: string;
  htmlFor: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  required?: boolean;
  hint?: string;
}

export function ImageUploadField({
  label,
  htmlFor,
  value,
  onChange,
  onUpload,
  required,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const validationError = validateUploadFile(file);
    if (validationError) {
      setError(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить изображение");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <FormField label={label} htmlFor={htmlFor} required={required} optional={!required} hint={hint}>
      <div className="space-y-3">
        {value ? (
          <img
            src={resolveMediaUrl(value)}
            alt=""
            className="w-full max-w-xs aspect-square object-cover rounded border border-[var(--border)]"
          />
        ) : null}

        <input
          ref={inputRef}
          id={htmlFor}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded text-sm bg-[var(--secondary)] text-[var(--foreground)] hover:opacity-90 disabled:opacity-50"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Загрузка…" : value ? "Заменить изображение" : "Выбрать файл"}
          </button>
          {value ? (
            <span className="text-sm text-[var(--muted-foreground)]">Изображение загружено</span>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {value ? (
          <button
            type="button"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            onClick={() => {
              setError(null);
              onChange("");
            }}
          >
            Убрать изображение
          </button>
        ) : null}
      </div>
    </FormField>
  );
}
