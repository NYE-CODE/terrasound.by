import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryFiltersSection } from "../../components/CategoryFiltersSection";
import { FormActions } from "../../components/FormActions";
import { PageHeader } from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  linkToDraft,
  syncCategoryAttributes,
  type CategoryAttributeDraft,
} from "../../lib/categoryAttributeDraft";
import { formCardClass, inputClass } from "../../lib/formStyles";
import { reportFormError } from "../../lib/formError";
import { api, type AttributeDef, type CategoryAttributeLink, type CategoryInput, type CategoryUpdateInput } from "../../lib/api";

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
  const [attributeLinks, setAttributeLinks] = useState<CategoryAttributeDraft[]>([]);
  const [initialLinks, setInitialLinks] = useState<CategoryAttributeLink[]>([]);
  const [allAttributes, setAllAttributes] = useState<AttributeDef[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      api.category(token, id),
      api.categoryAttributes(token, id),
      api.attributes(token),
    ])
      .then(([category, links, attributes]) => {
        setForm({
          id: category.id,
          name: category.name,
          imageUrl: category.imageUrl,
          sortOrder: category.sortOrder,
          gridCols: category.gridCols,
          gridTall: category.gridTall,
          published: category.published,
        });
        setInitialLinks(links);
        setAttributeLinks(links.map(linkToDraft));
        setAllAttributes(attributes);
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
        const payload: CategoryUpdateInput = {
          name: form.name,
          imageUrl: form.imageUrl,
          sortOrder: form.sortOrder,
          gridCols: form.gridCols,
          gridTall: form.gridTall,
          published: form.published,
        };
        await api.updateCategory(token, id, payload);
        await syncCategoryAttributes(token, id, initialLinks, attributeLinks);
        navigate("/categories");
      } else {
        await api.createCategory(token, form);
        navigate(`/categories/${form.id}/edit`);
      }
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
    <div className="max-w-4xl">
      <PageHeader
        title={isEdit ? "Редактирование категории" : "Новая категория"}
        backTo="/categories"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <section className={`${formCardClass} grid gap-4`}>
          <h2 className="font-heading text-lg">Основное</h2>

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
          <input
            placeholder="Название"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            required
          />
          <input
            placeholder="URL изображения"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className={inputClass}
            required
          />
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Порядок"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className={inputClass}
            />
            <select
              value={form.gridCols}
              onChange={(e) => setForm({ ...form, gridCols: Number(e.target.value) })}
              className={inputClass}
            >
              <option value={1}>Ширина: 1 колонка</option>
              <option value={2}>Ширина: 2 колонки</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.gridTall}
              onChange={(e) => setForm({ ...form, gridTall: e.target.checked })}
            />
            Высокая карточка на главной
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Опубликована
          </label>
        </section>

        {isEdit ? (
          <section className={formCardClass}>
            <CategoryFiltersSection
              links={attributeLinks}
              allAttributes={allAttributes}
              onChange={setAttributeLinks}
            />
          </section>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)] px-1">
            После создания категории здесь появится настройка полей товара и фильтров каталога.
          </p>
        )}

        <FormActions
          cancelTo="/categories"
          submitLabel={isEdit ? "Сохранить категорию" : "Создать категорию"}
          isSubmitting={submitting}
        />
      </form>
    </div>
  );
}
