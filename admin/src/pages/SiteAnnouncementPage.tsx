import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { reportFormError, reportLoadError } from "../lib/formError";
import { api, type SiteAnnouncement, type SiteAnnouncementInput } from "../lib/api";

const defaultForm: SiteAnnouncementInput = {
  text: "",
  enabled: false,
};

function toForm(announcement: SiteAnnouncement): SiteAnnouncementInput {
  return {
    text: announcement.text,
    enabled: announcement.enabled,
  };
}

export function SiteAnnouncementPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<SiteAnnouncementInput>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .siteAnnouncement(token)
      .then((announcement) => setForm(toForm(announcement)))
      .catch(reportLoadError)
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setSaved(false);
    try {
      const announcement = await api.updateSiteAnnouncement(token, form);
      setForm(toForm(announcement));
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
      <PageHeader title="Бегущая строка" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        Текст показывается над шапкой сайта и прокручивается автоматически. При скролле строка
        остаётся закреплённой вместе с шапкой. Если выключить показ или оставить текст пустым,
        полоска не отображается.
      </p>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-xl space-y-4`}>
        <FormField
          label="Текст"
          htmlFor="announcement-text"
          optional
          hint="До 512 символов. Например: скидка, акция или важное объявление."
        >
          <textarea
            id="announcement-text"
            maxLength={512}
            rows={3}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className={inputClass}
            placeholder="Бесплатная консультация по подбору автозвука — звоните!"
          />
        </FormField>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          <span className="text-sm">Показывать на сайте</span>
        </label>

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
