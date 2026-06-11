import { Link } from "react-router-dom";
import {
  FILTER_TYPE_LABELS,
  VALUE_TYPE_LABELS,
  defaultFilterType,
} from "../lib/filterTypes";
import { formCardClass, inputClass } from "../lib/formStyles";
import {
  attributeToDraft,
  patchDraft,
  removeDraft,
  type CategoryAttributeDraft,
} from "../lib/categoryAttributeDraft";
import type { AttributeDef } from "../lib/api";

interface CategoryFiltersSectionProps {
  links: CategoryAttributeDraft[];
  allAttributes: AttributeDef[];
  onChange: (links: CategoryAttributeDraft[]) => void;
}

export function CategoryFiltersSection({ links, allAttributes, onChange }: CategoryFiltersSectionProps) {
  const availableAttributes = allAttributes.filter(
    (attr) => !links.some((link) => link.attributeId === attr.id),
  );

  const addAttribute = (attributeId: string) => {
    const attr = allAttributes.find((item) => item.id === attributeId);
    if (!attr) return;
    onChange([...links, attributeToDraft(attr, links.length)]);
  };

  const updateLink = (clientId: string, patch: Partial<CategoryAttributeDraft>) => {
    onChange(patchDraft(links, clientId, patch));
  };

  const removeLink = (clientId: string, label: string) => {
    if (!confirm(`Убрать «${label}» из этой категории?`)) return;
    onChange(removeDraft(links, clientId));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg">Поля товара и фильтры каталога</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl">
            Характеристики для товаров этой категории. Вид фильтра задаётся в атрибуте — здесь
            только где показывать и диапазон для чисел. Изменения сохранятся вместе с категорией.
          </p>
        </div>
        <Link
          to="/attributes/new"
          className="text-sm text-[var(--accent)] hover:underline whitespace-nowrap"
        >
          + Новый атрибут
        </Link>
      </div>

      {availableAttributes.length > 0 && (
        <div className={`${formCardClass} flex flex-wrap gap-3 items-end`}>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm mb-1">Добавить характеристику</label>
            <select
              defaultValue=""
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                addAttribute(value);
                e.target.value = "";
              }}
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
        </div>
      )}

      {links.map((link) => {
        const filterLabel = link.filterType ? FILTER_TYPE_LABELS[link.filterType] : null;
        const canUseInFilters = defaultFilterType(link.valueType, link.options.length) !== null;

        return (
          <div key={link.clientId} className={`${formCardClass} space-y-3`}>
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
                  onClick={() => removeLink(link.clientId, link.attributeLabel)}
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
                  onChange={(e) => updateLink(link.clientId, { showInForm: e.target.checked })}
                />
                В форме товара
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.showInFilters}
                  disabled={!canUseInFilters}
                  onChange={(e) => updateLink(link.clientId, { showInFilters: e.target.checked })}
                />
                В фильтрах каталога
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.showOnCard}
                  onChange={(e) => updateLink(link.clientId, { showOnCard: e.target.checked })}
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
                      updateLink(link.clientId, {
                        filterMin: e.target.value === "" ? null : Number(e.target.value),
                      })
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
                      updateLink(link.clientId, {
                        filterMax: e.target.value === "" ? null : Number(e.target.value),
                      })
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
                    onChange={(e) => updateLink(link.clientId, { groupLabel: e.target.value || null })}
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
                  onChange={(e) => updateLink(link.clientId, { groupLabel: e.target.value || null })}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        );
      })}

      {links.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">
          Характеристики не привязаны. Выберите из справочника выше или создайте новый атрибут.
        </p>
      )}
    </div>
  );
}
