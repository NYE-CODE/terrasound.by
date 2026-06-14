import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { reportFormError, reportLoadError} from "../../lib/formError";
import { parseRequiredInt } from "../../lib/numbers";
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
  const { status } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    api.brands().then((items) => {
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
    }).catch(reportLoadError).finally(() => setLoading(false));
  }, [status, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") return;
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updateBrand(id, form);
      } else {
        await api.createBrand(form);
      }
      navigate("/brands");
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
      <PageHeader
        title={isEdit ? "Редактирование бренда" : "Новый бренд"}
        backTo="/brands"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid md:grid-cols-2 gap-4 max-w-2xl`}>
        <FormRequiredNote className="md:col-span-2" />

        <FormField label="Название" htmlFor="brand-name" required>
          <input
            id="brand-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Страна" htmlFor="brand-country" required>
          <input
            id="brand-country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Год основания" htmlFor="brand-since" required>
          <input
            id="brand-since"
            value={form.since}
            onChange={(e) => setForm({ ...form, since: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Порядок сортировки" htmlFor="brand-sort-order" optional>
          <input
            id="brand-sort-order"
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: parseRequiredInt(e.target.value, form.sortOrder) })
            }
            className={inputClass}
          />
        </FormField>

        <FormField label="Описание" htmlFor="brand-description" required className="md:col-span-2">
          <textarea
            id="brand-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={textareaClass}
            required
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
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
