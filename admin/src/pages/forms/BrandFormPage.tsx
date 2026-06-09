import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { api, type BrandInput } from "../../lib/api";

const emptyForm: BrandInput = {
  name: "",
  description: "",
  country: "",
  since: "",
  sortOrder: 0,
  published: true,
};

export function BrandFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api.brands(token).then((items) => {
      const item = items.find((b) => b.id === id);
      if (item) {
        setForm({
          name: item.name,
          description: item.description,
          country: item.country,
          since: item.since,
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
        await api.updateBrand(token, id, form);
      } else {
        await api.createBrand(token, form);
      }
      navigate("/brands");
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
        title={isEdit ? "Редактирование бренда" : "Новый бренд"}
        backTo="/brands"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid md:grid-cols-2 gap-4 max-w-2xl`}>
        <input placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        <input placeholder="Страна" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} required />
        <input placeholder="Год основания" value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} className={inputClass} required />
        <input type="number" placeholder="Порядок" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} />
        <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`md:col-span-2 ${textareaClass}`} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликован
        </label>
        <div className="md:col-span-2">
          <FormActions cancelTo="/brands" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
        </div>
      </form>
    </div>
  );
}
