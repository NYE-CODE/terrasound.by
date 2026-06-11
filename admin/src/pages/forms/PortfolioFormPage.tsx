import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass } from "../../lib/formStyles";
import { api, type PortfolioWorkInput } from "../../lib/api";

const emptyForm: PortfolioWorkInput = {
  title: "",
  imageUrl: "",
  sortOrder: 0,
  published: true,
};

export function PortfolioFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api
      .portfolioWorks(token)
      .then((items) => {
        const item = items.find((work) => work.id === id);
        if (item) {
          setForm({
            title: item.title,
            imageUrl: item.imageUrl,
            sortOrder: item.sortOrder,
            published: item.published,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updatePortfolioWork(token, id, form);
      } else {
        await api.createPortfolioWork(token, form);
      }
      navigate("/portfolio");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-[var(--muted-foreground)]">Загрузка...</div>;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Редактирование работы" : "Новая работа"}
        backTo="/portfolio"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <input
          placeholder="Подпись (например, BMW 5 Series)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
          required
        />
        <input
          placeholder="URL фото"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className={inputClass}
          required
        />
        <input
          type="number"
          placeholder="Порядок сортировки"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className={inputClass}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Опубликована
        </label>
        <FormActions
          cancelTo="/portfolio"
          submitLabel={isEdit ? "Сохранить" : "Создать"}
          isSubmitting={submitting}
        />
      </form>
    </div>
  );
}
