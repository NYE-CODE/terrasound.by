import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass, textareaClass } from "../../lib/formStyles";
import { reportFormError, reportLoadError} from "../../lib/formError";
import { parseRequiredInt } from "../../lib/numbers";
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
  const { status } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    api.services().then((items) => {
      const item = items.find((s) => s.id === id);
      if (item) {
        setForm({
          title: item.title,
          description: item.description,
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
        await api.updateService(id, form);
      } else {
        await api.createService(form);
      }
      navigate("/services");
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
        title={isEdit ? "Редактирование услуги" : "Новая услуга"}
        backTo="/services"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <FormRequiredNote />

        <FormField label="Название" htmlFor="service-title" required>
          <input
            id="service-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Описание" htmlFor="service-description" required>
          <textarea
            id="service-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={textareaClass}
            required
          />
        </FormField>

        <FormField label="Порядок сортировки" htmlFor="service-sort-order" optional>
          <input
            id="service-sort-order"
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: parseRequiredInt(e.target.value, form.sortOrder) })
            }
            className={inputClass}
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликовано
        </label>

        <FormActions cancelTo="/services" submitLabel={isEdit ? "Сохранить" : "Создать"} isSubmitting={submitting} />
      </form>
    </div>
  );
}
