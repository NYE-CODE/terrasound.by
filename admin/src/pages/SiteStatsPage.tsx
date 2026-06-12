import { FormEvent, useEffect, useState } from "react";
import { FormField, FormRequiredNote } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { reportFormError, reportLoadError} from "../lib/formError";
import { api, type SiteStats, type SiteStatsInput } from "../lib/api";

const defaultForm: SiteStatsInput = {
  installationsCompleted: "1200+",
  yearsExpertise: "8",
};

export function SiteStatsPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<SiteStatsInput>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .siteStats(token)
      .then((stats: SiteStats) => {
        setForm({
          installationsCompleted: stats.installationsCompleted,
          yearsExpertise: stats.yearsExpertise,
        });
      })
      .catch(reportLoadError)
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setSaved(false);
    try {
      const stats = await api.updateSiteStats(token, form);
      setForm({
        installationsCompleted: stats.installationsCompleted,
        yearsExpertise: stats.yearsExpertise,
      });
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
      <PageHeader title="Наши достижения" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        Значения отображаются на главной странице как есть — можно использовать цифры, текст и
        символы (например, «1200+» или «8 лет»). Третий блок («100% — Профессионалы своего дела»)
        задаётся в коде сайта.
      </p>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-xl space-y-4`}>
        <FormRequiredNote />

        <FormField
          label="Подобранных систем"
          htmlFor="stats-installations"
          required
          hint={`На сайте: ${form.installationsCompleted || "…"} — Подобранных систем`}
        >
          <input
            id="stats-installations"
            type="text"
            maxLength={64}
            value={form.installationsCompleted}
            onChange={(e) =>
              setForm({ ...form, installationsCompleted: e.target.value })
            }
            className={inputClass}
            required
          />
        </FormField>

        <FormField
          label="Опыт установки и подбора систем"
          htmlFor="stats-years"
          required
          hint={`На сайте: ${form.yearsExpertise || "…"} — Опыт установки и подбора систем`}
        >
          <input
            id="stats-years"
            type="text"
            maxLength={64}
            value={form.yearsExpertise}
            onChange={(e) => setForm({ ...form, yearsExpertise: e.target.value })}
            className={inputClass}
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

        {saved && (
          <p className="text-sm text-[#86efac]">Настройки сохранены</p>
        )}
      </form>
    </div>
  );
}
