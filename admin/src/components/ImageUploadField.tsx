import { useRef, useState } from "react";
import { FormField } from "./FormField";
import { resolveMediaUrl } from "../lib/mediaUrl";

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
          className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[var(--secondary)] file:text-[var(--foreground)]"
          disabled={uploading}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        {uploading ? <p className="text-sm text-[var(--muted-foreground)]">Загрузка…</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {value ? (
          <button
            type="button"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            onClick={() => onChange("")}
          >
            Убрать изображение
          </button>
        ) : null}
      </div>
    </FormField>
  );
}
