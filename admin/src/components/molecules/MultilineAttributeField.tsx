import { useEffect, useRef, useState } from "react";
import { Rows3 } from "lucide-react";
import {
  ATTRIBUTE_TEXT_MAX_LENGTH,
  attributeTextHasLineBreaks,
  clampAttributeText,
  formatAttributeTextPreview,
} from "../../lib/attributeText";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";

interface MultilineAttributeFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label: string;
}

export function MultilineAttributeField({
  id,
  value,
  onChange,
  required,
  label,
}: MultilineAttributeFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasLineBreaks = attributeTextHasLineBreaks(value);
  const nearLimit = value.length >= ATTRIBUTE_TEXT_MAX_LENGTH - 20;

  useEffect(() => {
    if (!modalOpen) return;
    textareaRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  const handleMainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(clampAttributeText(event.target.value));
  };

  const handleModalChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(clampAttributeText(event.target.value));
  };

  const openModal = () => setModalOpen(true);

  return (
    <>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={hasLineBreaks ? formatAttributeTextPreview(value) : value}
          onChange={hasLineBreaks ? undefined : handleMainChange}
          onClick={hasLineBreaks ? openModal : undefined}
          readOnly={hasLineBreaks}
          required={required}
          maxLength={ATTRIBUTE_TEXT_MAX_LENGTH}
          title={hasLineBreaks ? "Многострочное значение — нажмите, чтобы редактировать" : undefined}
          className={`${inputClass} pr-11 ${hasLineBreaks ? "cursor-pointer truncate text-[var(--muted-foreground)]" : ""}`}
        />
        <button
          type="button"
          onClick={openModal}
          className={`absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222] transition-colors ${
            hasLineBreaks ? "text-[var(--accent)]" : ""
          }`}
          aria-label={`Многострочное редактирование: ${label}`}
        >
          <Rows3 size={18} aria-hidden="true" />
        </button>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setModalOpen(false)}
        >
          <div
            className={`${formCardClass} w-full max-w-md space-y-4`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id ? `${id}-modal-title` : undefined}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-1">
              <h3
                id={id ? `${id}-modal-title` : undefined}
                className="font-heading text-sm uppercase tracking-wider"
              >
                {label}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Enter — новая строка. После переноса основное поле показывает краткий preview; правка — здесь.
              </p>
            </div>

            <textarea
              ref={textareaRef}
              rows={5}
              value={value}
              onChange={handleModalChange}
              maxLength={ATTRIBUTE_TEXT_MAX_LENGTH}
              className={`${textareaClass} min-h-[7.5rem]`}
            />

            <p
              className={`text-xs text-right ${
                nearLimit ? "text-[var(--destructive)]" : "text-[var(--muted-foreground)]"
              }`}
            >
              {value.length}/{ATTRIBUTE_TEXT_MAX_LENGTH}
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 px-5 rounded bg-[var(--accent)] text-[var(--accent-foreground)] font-heading text-sm uppercase tracking-wider"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
