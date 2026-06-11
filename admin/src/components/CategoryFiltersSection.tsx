import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FILTER_TYPE_LABELS,
  VALUE_TYPE_LABELS,
  defaultFilterType,
} from "../lib/filterTypes";
import { formCardClass, inputClass } from "../lib/formStyles";
import { ApiError, api, type AttributeDef, type CategoryAttributeInput, type CategoryAttributeLink } from "../lib/api";

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
    const canFilter = attr ? defaultFilterType(attr.valueType, attr.options.length) !== null : false;
    setSubmitting(true);
    try {
      const payload: CategoryAttributeInput = {
        attributeId: newAttributeId,
        showInForm: true,
        showInFilters: canFilter,
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
    await api.updateCategoryAttribute(token, categoryId, link.id, patch);
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
            Привяжите характеристики к категории. <strong>Как выглядит фильтр</strong> (галочки, список, ползунок)
            задаётся при создании атрибута. Здесь — только включить в форму товара / в каталог / на карточку
            и для чисел — диапазон ползунка.
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

      {links.map((link) => {
        const filterLabel = link.filterType ? FILTER_TYPE_LABELS[link.filterType] : null;
        const canUseInFilters = defaultFilterType(link.valueType, link.options.length) !== null;

        return (
          <div key={link.id} className={`${formCardClass} space-y-3`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-heading">{link.attributeLabel}</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {link.attributeId} · {VALUE_TYPE_LABELS[link.valueType] ?? link.valueType}
                  {link.unit ? ` · ${link.unit}` : ""}
                  {filterLabel && link.showInFilters ? ` · фильтр: ${filterLabel}` : ""}
                </div>
                {link.options.length > 0 && (
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    Варианты: {link.options.map((o) => o.label).join(", ")}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Link
                  to={`/attributes/${link.attributeId}/edit`}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  Изменить атрибут
                </Link>
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Убрать
                </button>
              </div>
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
                  disabled={!canUseInFilters}
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

            {!canUseInFilters && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Текстовые атрибуты нельзя использовать в фильтрах каталога.
              </p>
            )}

            {link.showInFilters && link.valueType === "number" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-[var(--border)]">
                <div>
                  <label className="block text-xs mb-1">Мин. ползунка</label>
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
                  <label className="block text-xs mb-1">Макс. ползунка</label>
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

            {link.showInFilters && link.valueType !== "number" && (
              <div className="pt-2 border-t border-[var(--border)]">
                <label className="block text-xs mb-1">Группа в фильтрах (необязательно)</label>
                <input
                  type="text"
                  placeholder="напр. Подключение"
                  value={link.groupLabel ?? ""}
                  onChange={(e) => updateLink(link, { groupLabel: e.target.value || null })}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        );
      })}

      {links.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">
          Характеристики не привязаны. Добавьте из справочника или создайте новый атрибут.
        </p>
      )}
    </div>
  );
}
