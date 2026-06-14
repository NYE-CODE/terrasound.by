import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { reportFormError, reportLoadError } from "../lib/formError";
import { api, type ProductHighlights, type ProductHighlightsInput } from "../lib/api";

const DEFAULT_LINES = [
  "Бесплатная консультация перед покупкой",
  "Гарантия 2 года на всё оборудование",
  "Доступна профессиональная установка",
];

function highlightsToText(highlights: string[]): string {
  return highlights.join("\n");
}

function textToHighlights(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProductHighlightsPage() {
  const { token } = useAuth();
  const [text, setText] = useState(highlightsToText(DEFAULT_LINES));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .productHighlights(token)
      .then((data: ProductHighlights) => setText(highlightsToText(data.highlights)))
      .catch(reportLoadError)
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setSaved(false);
    const payload: ProductHighlightsInput = { highlights: textToHighlights(text) };
    try {
      const data = await api.updateProductHighlights(token, payload);
      setText(highlightsToText(data.highlights));
      setSaved(true);
    } catch (error) {
      reportFormError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-[var(--muted-foreground)]">Загрузка...</div>;
  }

  return (
    <div>
      <PageHeader title="Преимущества на странице товара" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        Пункты отображаются под кнопкой «В корзину» на странице товара. Каждая строка — отдельный
        пункт списка (маркер «•» добавляется автоматически). Пустые строки игнорируются.
      </p>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-xl space-y-4`}>
        <FormField
          label="Пункты списка"
          htmlFor="product-highlights"
          optional
          hint="До 10 пунктов, каждый — до 256 символов"
        >
          <textarea
            id="product-highlights"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={inputClass}
            placeholder={DEFAULT_LINES.join("\n")}
          />
        </FormField>

        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded disabled:opacity-60"
        >
          {submitting ? "Сохранение..." : "Сохранить"}
        </button>

        {saved && <p className="text-sm text-[#86efac]">Настройки сохранены</p>}
      </form>
    </div>
  );
}
