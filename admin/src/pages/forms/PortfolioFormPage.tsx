import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormActions } from "../../components/FormActions";
import { FormField, FormRequiredNote } from "../../components/FormField";
import { ImageUploadField } from "../../components/ImageUploadField";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass } from "../../lib/formStyles";
import { reportFormError, reportLoadError} from "../../lib/formError";
import { parseRequiredInt } from "../../lib/numbers";
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
      .catch(reportLoadError)
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!form.imageUrl.trim()) {
      alert("Загрузите фото работы.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await api.updatePortfolioWork(token, id, form);
      } else {
        await api.createPortfolioWork(token, form);
      }
      navigate("/portfolio");
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
        title={isEdit ? "Редактирование работы" : "Новая работа"}
        backTo="/portfolio"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4 max-w-2xl`}>
        <FormRequiredNote />

        <FormField label="Подпись" htmlFor="portfolio-title" required hint="Например: BMW 5 Series">
          <input
            id="portfolio-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <ImageUploadField
          label="Фото"
          htmlFor="portfolio-image-upload"
          required
          value={form.imageUrl}
          onChange={(imageUrl) => setForm({ ...form, imageUrl })}
          onUpload={async (file) => {
            if (!token) throw new Error("Нужна авторизация");
            const result = await api.uploadPortfolioImage(token, file, isEdit ? id : undefined);
            return result.url;
          }}
        />

        <FormField label="Порядок сортировки" htmlFor="portfolio-sort-order" optional>
          <input
            id="portfolio-sort-order"
            type="number"
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: parseRequiredInt(e.target.value, form.sortOrder) })
            }
            className={inputClass}
          />
        </FormField>

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
