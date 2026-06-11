import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { api, type InstallationServiceInput } from "../../lib/api";

const emptyForm: InstallationServiceInput = {
  title: "",
  description: "",
  sortOrder: 0,
  published: true,
};

export function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api.services(token).then((items) => {
      const item = items.find((s) => s.id === id);
      if (item) {
        setForm({
          title: item.title,
          description: item.description,
          sortOrder: item.sortOrder,
          published: item.published,
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updateService(token, id, form);
      } else {
        await api.createService(token, form);
      }
      navigate("/services");
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
        title={isEdit ? "Редактирование услуги" : "Новая услуга"}
        backTo="/services"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <input placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} required />
        <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={textareaClass} required />
        <input type="number" placeholder="Порядок сортировки" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликовано
        </label>
        <FormActions cancelTo="/services" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
