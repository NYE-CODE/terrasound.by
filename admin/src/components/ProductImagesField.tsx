import { useRef, useState } from "react";
import { FormField } from "./FormField";
import { resolveMediaUrl } from "../lib/mediaUrl";

interface ProductImagesFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (file: File) => Promise<string>;
}

export function ProductImagesField({ images, onChange, onUpload }: ProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await onUpload(file));
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить изображение");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <FormField
      label="Дополнительные изображения"
      htmlFor="product-gallery-upload"
      optional
      hint="Можно выбрать несколько файлов. JPEG, PNG или WebP до 10 МБ."
    >
      <div className="space-y-3">
        {images.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <img
                  src={resolveMediaUrl(url)}
                  alt=""
                  className="w-20 h-20 object-cover rounded border border-[var(--border)]"
                />
                <button
                  type="button"
                  aria-label="Удалить изображение"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs"
                  onClick={() => removeAt(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <input
          ref={inputRef}
          id="product-gallery-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[var(--secondary)] file:text-[var(--foreground)]"
          disabled={uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {uploading ? <p className="text-sm text-[var(--muted-foreground)]">Загрузка…</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </FormField>
  );
}
