import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { reportFormError } from "../lib/formError";
import { api, type SiteStats, type SiteStatsInput } from "../lib/api";

const defaultForm: SiteStatsInput = {
  installationsCompleted: 1200,
  yearsExpertise: 8,
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
      .catch(console.error)
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
      <PageHeader title="Статистика сайта" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        Цифры отображаются в блоке статистики на главной. Количество подобранных систем показывается
        с суффиксом «+». Третий блок («100% — Профессионалы своего дела») задаётся в коде сайта.
      </p>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-xl space-y-4`}>
        <div>
          <label className="block text-sm mb-2">Подобранных систем</label>
          <input
            type="number"
            min={0}
            max={1000000}
            value={form.installationsCompleted}
            onChange={(e) =>
              setForm({ ...form, installationsCompleted: Number(e.target.value) })
            }
            className={inputClass}
            required
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            На сайте: {form.installationsCompleted.toLocaleString("ru-RU")}+ — Подобранных систем
          </p>
        </div>

        <div>
          <label className="block text-sm mb-2">Опыт установки и подбора систем</label>
          <input
            type="number"
            min={0}
            max={200}
            value={form.yearsExpertise}
            onChange={(e) => setForm({ ...form, yearsExpertise: Number(e.target.value) })}
            className={inputClass}
            required
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            На сайте: {form.yearsExpertise} — Опыт установки и подбора систем
          </p>
        </div>

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
