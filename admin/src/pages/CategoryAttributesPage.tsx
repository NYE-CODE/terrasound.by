import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { ApiError, api, type AttributeDef, type CategoryAttributeInput, type CategoryAttributeLink } from "../lib/api";

export function CategoryAttributesPage() {
  const { id: categoryId } = useParams();
  const { token } = useAuth();
  const [categoryName, setCategoryName] = useState("");
  const [links, setLinks] = useState<CategoryAttributeLink[]>([]);
  const [allAttributes, setAllAttributes] = useState<AttributeDef[]>([]);
  const [newAttributeId, setNewAttributeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!token || !categoryId) return;
    Promise.all([
      api.category(token, categoryId),
      api.categoryAttributes(token, categoryId),
      api.attributes(token),
    ])
      .then(([category, categoryLinks, attributes]) => {
        setCategoryName(category.name);
        setLinks(categoryLinks);
        setAllAttributes(attributes);
      })
      .catch(console.error);
  };

  useEffect(load, [token, categoryId]);

  const availableAttributes = allAttributes.filter(
    (attr) => !links.some((link) => link.attributeId === attr.id),
  );

  const addLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !categoryId || !newAttributeId) return;
    setSubmitting(true);
    try {
      const payload: CategoryAttributeInput = {
        attributeId: newAttributeId,
        showInForm: true,
        showInFilters: false,
        sortOrder: links.length,
      };
      await api.createCategoryAttribute(token, categoryId, payload);
      setNewAttributeId("");
      load();
    } catch (error) {
      if (error instanceof ApiError) alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateLink = async (link: CategoryAttributeLink, patch: Partial<CategoryAttributeInput>) => {
    if (!token || !categoryId) return;
    await api.updateCategoryAttribute(token, categoryId, link.id, patch);
    load();
  };

  const removeLink = async (linkId: number) => {
    if (!token || !categoryId) return;
    await api.deleteCategoryAttribute(token, categoryId, linkId);
    load();
  };

  return (
    <div>
      <PageHeader
        title={`Фильтры: ${categoryName || categoryId}`}
        backTo="/categories"
      />

      <form onSubmit={addLink} className={`${formCardClass} flex flex-wrap gap-3 items-end mb-6 max-w-3xl`}>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm mb-1">Добавить атрибут</label>
          <select
            value={newAttributeId}
            onChange={(e) => setNewAttributeId(e.target.value)}
            className={inputClass}
          >
            <option value="">Выберите атрибут</option>
            {availableAttributes.map((attr) => (
              <option key={attr.id} value={attr.id}>
                {attr.label} ({attr.id})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!newAttributeId || submitting}
          className="h-10 px-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded disabled:opacity-50"
        >
          Добавить
        </button>
      </form>

      <div className="space-y-4 max-w-4xl">
        {links.map((link) => (
          <div key={link.id} className={`${formCardClass} space-y-3`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-heading">{link.attributeLabel}</div>
                <div className="text-sm text-[var(--muted-foreground)]">{link.attributeId} · {link.valueType}</div>
              </div>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Удалить
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.showInForm}
                  onChange={(e) => updateLink(link, { showInForm: e.target.checked })}
                />
                В форме товара
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.showInFilters}
                  onChange={(e) => updateLink(link, { showInFilters: e.target.checked })}
                />
                В фильтрах
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.showOnCard}
                  onChange={(e) => updateLink(link, { showOnCard: e.target.checked })}
                />
                На карточке
              </label>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs mb-1">Тип фильтра</label>
                <select
                  value={link.filterType ?? ""}
                  onChange={(e) => updateLink(link, { filterType: e.target.value || null })}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="checkbox">Чекбокс</option>
                  <option value="dropdown">Выпадающий</option>
                  <option value="multiselect">Мультивыбор</option>
                  <option value="range">Ползунок</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Min</label>
                <input
                  type="number"
                  value={link.filterMin ?? ""}
                  onChange={(e) =>
                    updateLink(link, { filterMin: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Max</label>
                <input
                  type="number"
                  value={link.filterMax ?? ""}
                  onChange={(e) =>
                    updateLink(link, { filterMax: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Группа</label>
                <input
                  type="text"
                  value={link.groupLabel ?? ""}
                  onChange={(e) => updateLink(link, { groupLabel: e.target.value || null })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Атрибуты для этой категории ещё не настроены</p>
        )}
      </div>
    </div>
  );
}
