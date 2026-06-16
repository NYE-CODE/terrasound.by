import { FormEvent, useEffect, useState } from "react";
import { FormField, FormRequiredNote } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../lib/formStyles";
import { reportFormError, reportLoadError } from "../lib/formError";
import { api, type LegalPageSlug, type SiteLegalPageInput } from "../lib/api";

const tabs: { slug: LegalPageSlug; label: string; path: string }[] = [
  { slug: "privacy", label: "Политика конфиденциальности", path: "/privacy" },
  { slug: "terms", label: "Условия использования", path: "/terms" },
];

const emptyForm: SiteLegalPageInput = {
  title: "",
  content: "",
};

export function SiteLegalPage() {
  const { status } = useAuth();
  const [activeSlug, setActiveSlug] = useState<LegalPageSlug>("privacy");
  const [forms, setForms] = useState<Record<LegalPageSlug, SiteLegalPageInput>>({
    privacy: emptyForm,
    terms: emptyForm,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .legalPages()
      .then((pages) => {
        const next: Record<LegalPageSlug, SiteLegalPageInput> = {
          privacy: emptyForm,
          terms: emptyForm,
        };
        for (const page of pages) {
          next[page.slug] = { title: page.title, content: page.content };
        }
        setForms(next);
      })
      .catch(reportLoadError)
      .finally(() => setLoading(false));
  }, [status]);

  const form = forms[activeSlug];
  const activeTab = tabs.find((tab) => tab.slug === activeSlug)!;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") return;
    setSubmitting(true);
    setSaved(false);
    try {
      const page = await api.updateLegalPage(activeSlug, form);
      setForms((current) => ({
        ...current,
        [activeSlug]: { title: page.title, content: page.content },
      }));
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
      <PageHeader title="Политика и условия" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-3xl">
        Тексты страниц <code className="text-[var(--foreground)]">/privacy</code> и{" "}
        <code className="text-[var(--foreground)]">/terms</code>. Для разделов используйте строки,
        начинающиеся с <code className="text-[var(--foreground)]">## </code> — они станут подзаголовками на
        сайте.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => {
              setActiveSlug(tab.slug);
              setSaved(false);
            }}
            className={`h-10 px-4 rounded text-sm font-medium transition-colors ${
              activeSlug === tab.slug
                ? "bg-[var(--accent)] text-[#0e0e0f]"
                : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-3xl space-y-4`}>
        <FormRequiredNote />

        <p className="text-sm text-[var(--muted-foreground)]">
          Публичная страница:{" "}
          <a
            href={`https://terrasound.by${activeTab.path}`}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            {activeTab.path}
          </a>
        </p>

        <FormField label="Заголовок страницы" htmlFor="legal-title" required>
          <input
            id="legal-title"
            type="text"
            maxLength={255}
            value={form.title}
            onChange={(e) =>
              setForms((current) => ({
                ...current,
                [activeSlug]: { ...current[activeSlug], title: e.target.value },
              }))
            }
            className={inputClass}
            required
          />
        </FormField>

        <FormField
          label="Содержимое"
          htmlFor="legal-content"
          required
          hint="Пример: ## Заголовок раздела, затем пустая строка и текст абзаца."
        >
          <textarea
            id="legal-content"
            value={form.content}
            onChange={(e) =>
              setForms((current) => ({
                ...current,
                [activeSlug]: { ...current[activeSlug], content: e.target.value },
              }))
            }
            className={`${textareaClass} min-h-[24rem] font-mono text-sm`}
            required
          />
        </FormField>

        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded disabled:opacity-60"
        >
          {submitting ? "Сохранение..." : "Сохранить"}
        </button>

        {saved && <p className="text-sm text-[#86efac]">Страница сохранена</p>}
      </form>
    </div>
  );
}
