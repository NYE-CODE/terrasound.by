import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { ApiError, api, type AttributeDef, type CategoryAttributeInput, type CategoryAttributeLink } from "../lib/api";

const VALUE_TYPE_LABELS: Record<string, string> = {
  text: "Текст",
  number: "Число",
  boolean: "Да / нет",
  enum: "Список вариантов",
};

function defaultFilterType(valueType: string): string | null {
  if (valueType === "boolean") return "checkbox";
  if (valueType === "number") return "range";
  if (valueType === "enum") return "dropdown";
  return null;
}

interface CategoryFiltersSectionProps {
  categoryId: string;
}

export function CategoryFiltersSection({ categoryId }: CategoryFiltersSectionProps) {
  const { token } = useAuth();
  const [links, setLinks] = useState<CategoryAttributeLink[]>([]);
  const [allAttributes, setAllAttributes] = useState<AttributeDef[]>([]);
  const [newAttributeId, setNewAttributeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token || !categoryId) return;
    setLoading(true);
    Promise.all([
      api.categoryAttributes(token, categoryId),
      api.attributes(token),
    ])
      .then(([categoryLinks, attributes]) => {
        setLinks(categoryLinks);
        setAllAttributes(attributes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [token, categoryId]);

  const availableAttributes = allAttributes.filter(
    (attr) => !links.some((link) => link.attributeId === attr.id),
  );

  const addLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newAttributeId) return;
    const attr = allAttributes.find((a) => a.id === newAttributeId);
    setSubmitting(true);
    try {
      const filterType = attr ? defaultFilterType(attr.valueType) : null;
      const payload: CategoryAttributeInput = {
        attributeId: newAttributeId,
        showInForm: true,
        showInFilters: filterType !== null,
        filterType,
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
    if (!token) return;
    let nextPatch = { ...patch };
    if (patch.showInFilters === true && !link.filterType && !patch.filterType) {
      nextPatch.filterType = defaultFilterType(link.valueType);
    }
    if (patch.showInFilters === false) {
      nextPatch.filterType = null;
    }
    await api.updateCategoryAttribute(token, categoryId, link.id, nextPatch);
    load();
  };

  const removeLink = async (linkId: number) => {
    if (!token || !confirm("Убрать атрибут из этой категории?")) return;
    await api.deleteCategoryAttribute(token, categoryId, linkId);
    load();
  };

  if (loading) {
    return <p className="text-sm text-[var(--muted-foreground)]">Загрузка полей и фильтров…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg">Поля товара и фильтры каталога</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl">
            Выберите характеристики для этой категории. «В форме товара» — при создании товара.
            «В фильтрах» — в каталоге для посетителей. Справочник атрибутов — в разделе{" "}
            <Link to="/attributes" className="text-[var(--accent)] hover:underline">Атрибуты</Link>.
          </p>
        </div>
        <Link
          to="/attributes/new"
          className="text-sm text-[var(--accent)] hover:underline whitespace-nowrap"
        >
          + Новый атрибут
        </Link>
      </div>

      <form onSubmit={addLink} className={`${formCardClass} flex flex-wrap gap-3 items-end`}>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm mb-1">Добавить характеристику</label>
          <select
            value={newAttributeId}
            onChange={(e) => setNewAttributeId(e.target.value)}
            className={inputClass}
          >
            <option value="">Выберите из справочника</option>
            {availableAttributes.map((attr) => (
              <option key={attr.id} value={attr.id}>
                {attr.label} — {VALUE_TYPE_LABELS[attr.valueType] ?? attr.valueType}
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

      {links.map((link) => (
        <div key={link.id} className={`${formCardClass} space-y-3`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-heading">{link.attributeLabel}</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {link.attributeId} · {VALUE_TYPE_LABELS[link.valueType] ?? link.valueType}
                {link.unit ? ` · ${link.unit}` : ""}
                {link.options.length > 0 && ` · ${link.options.map((o) => o.label).join(", ")}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeLink(link.id)}
              className="text-sm text-red-400 hover:text-red-300 shrink-0"
            >
              Убрать
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
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
              В фильтрах каталога
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={link.showOnCard}
                onChange={(e) => updateLink(link, { showOnCard: e.target.checked })}
              />
              На карточке товара
            </label>
          </div>

          {link.showInFilters && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[var(--border)]">
              <div>
                <label className="block text-xs mb-1">Вид фильтра</label>
                <select
                  value={link.filterType ?? ""}
                  onChange={(e) => updateLink(link, { filterType: e.target.value || null })}
                  className={inputClass}
                >
                  <option value="">Не выбран</option>
                  <option value="checkbox">Чекбокс</option>
                  <option value="dropdown">Выпадающий список</option>
                  <option value="multiselect">Несколько значений</option>
                  <option value="range">Ползунок (число)</option>
                </select>
              </div>
              {link.valueType === "number" && (
                <>
                  <div>
                    <label className="block text-xs mb-1">Мин. (ползунок)</label>
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
                    <label className="block text-xs mb-1">Макс. (ползунок)</label>
                    <input
                      type="number"
                      value={link.filterMax ?? ""}
                      onChange={(e) =>
                        updateLink(link, { filterMax: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs mb-1">Группа в фильтрах</label>
                <input
                  type="text"
                  placeholder="напр. Мощность"
                  value={link.groupLabel ?? ""}
                  onChange={(e) => updateLink(link, { groupLabel: e.target.value || null })}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {links.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">
          Характеристики не привязаны. Добавьте из справочника или создайте новый атрибут.
        </p>
      )}
    </div>
  );
}
