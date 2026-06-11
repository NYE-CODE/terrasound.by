import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryFiltersSection } from "../../components/CategoryFiltersSection";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formCardClass, inputClass } from "../../lib/formStyles";
import { api, type CategoryInput, type CategoryUpdateInput } from "../../lib/api";

const emptyForm: CategoryInput = {
  id: "",
  name: "",
  imageUrl: "",
  sortOrder: 0,
  gridCols: 1,
  gridTall: false,
  published: true,
};

export function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api.category(token, id).then((item) => {
      setForm({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder,
        gridCols: item.gridCols,
        gridTall: item.gridTall,
        published: item.published,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (isEdit && id) {
        const payload: CategoryUpdateInput = {
          name: form.name,
          imageUrl: form.imageUrl,
          sortOrder: form.sortOrder,
          gridCols: form.gridCols,
          gridTall: form.gridTall,
          published: form.published,
        };
        await api.updateCategory(token, id, payload);
        navigate("/categories");
      } else {
        await api.createCategory(token, form);
        navigate(`/categories/${form.id}/edit`);
      }
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
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title={isEdit ? "Редактирование категории" : "Новая категория"}
        backTo="/categories"
      />

      <form onSubmit={handleSubmit} className={`${formCardClass} grid gap-4`}>
        {!isEdit && (
          <input
            placeholder="Slug (например, speakers)"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            className={inputClass}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required
          />
        )}
        {isEdit && (
          <div className="text-sm text-[var(--muted-foreground)]">
            Slug: <span className="text-[var(--foreground)]">{form.id}</span> (не изменяется)
          </div>
        )}
        <input placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        <input placeholder="URL изображения" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} required />
        <div className="grid md:grid-cols-2 gap-4">
          <input type="number" placeholder="Порядок" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} />
          <select value={form.gridCols} onChange={(e) => setForm({ ...form, gridCols: Number(e.target.value) })} className={inputClass}>
            <option value={1}>Ширина: 1 колонка</option>
            <option value={2}>Ширина: 2 колонки</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.gridTall} onChange={(e) => setForm({ ...form, gridTall: e.target.checked })} />
          Высокая карточка на главной
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Опубликована
        </label>
        <FormActions
          cancelTo="/categories"
          submitLabel={isEdit ? "Сохранить категорию" : "Создать и настроить фильтры"}
          isSubmitting={submitting}
        />
      </form>

      {isEdit && id ? (
        <CategoryFiltersSection categoryId={id} />
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          После создания категории здесь появится настройка полей товара и фильтров каталога.
        </p>
      )}
    </div>
  );
}
