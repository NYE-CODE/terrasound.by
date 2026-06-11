import { CheckboxMultiSelectDropdown } from "../molecules/CheckboxMultiSelectDropdown";
import type { CategoryFilter, CategoryFilters } from "../../lib/api";

const filterGroupTitleClass = "font-heading text-[13px] uppercase tracking-wide leading-snug";
const filterFieldTitleClass = `${filterGroupTitleClass} break-words`;

export type AttributeFilterState = Record<
  string,
  string | string[] | boolean | { min?: number; max?: number }
>;

interface AttributeFiltersProps {
  config: CategoryFilters | null;
  values: AttributeFilterState;
  onChange: (values: AttributeFilterState) => void;
}

export function AttributeFilters({ config, values, onChange }: AttributeFiltersProps) {
  if (!config || config.filters.length === 0) return null;

  const setValue = (
    attributeId: string,
    value: string | string[] | boolean | { min?: number; max?: number } | undefined,
  ) => {
    const next = { ...values };
    if (
      value === undefined
      || value === ""
      || value === false
      || (Array.isArray(value) && value.length === 0)
    ) {
      delete next[attributeId];
    } else {
      next[attributeId] = value;
    }
    onChange(next);
  };

  const groups = config.filters.reduce<Record<string, CategoryFilter[]>>((acc, filter) => {
    const key = filter.groupLabel || "";
    acc[key] = acc[key] || [];
    acc[key].push(filter);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groups).map(([group, filters]) => (
        <div key={group || "default"} className="pt-6 border-t border-border space-y-4">
          {group && (
            <h3 className={filterGroupTitleClass}>{group}</h3>
          )}
          {filters.map((filter) => (
            <FilterField
              key={filter.attributeId}
              filter={filter}
              value={values[filter.attributeId]}
              onChange={(value) => setValue(filter.attributeId, value)}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function FilterField({
  filter,
  value,
  onChange,
}: {
  filter: CategoryFilter;
  value: string | string[] | boolean | { min?: number; max?: number } | undefined;
  onChange: (value: string | string[] | boolean | { min?: number; max?: number } | undefined) => void;
}) {
  if (filter.filterType === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked ? true : undefined)}
          className="accent-accent"
        />
        {filter.label}
      </label>
    );
  }

  if (filter.filterType === "range") {
    const range = typeof value === "object" && value && !Array.isArray(value) ? value : {};
    const min = filter.filterMin ?? 0;
    const max = filter.filterMax ?? 100;
    const currentMax = range.max ?? max;
    return (
      <div>
        <h4 className={`${filterFieldTitleClass} mb-3`}>
          {filter.label}
          {filter.unit ? ` (${filter.unit})` : ""}
        </h4>
        <input
          type="range"
          min={min}
          max={max}
          step={filter.filterStep ?? 1}
          value={currentMax}
          onChange={(e) => {
            const nextMax = Number(e.target.value);
            onChange(nextMax >= max ? undefined : { min, max: nextMax });
          }}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{min}</span>
          <span>до {currentMax}</span>
        </div>
      </div>
    );
  }

  if (filter.filterType === "multiselect") {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div>
        <h4 className={`${filterFieldTitleClass} mb-2`}>{filter.label}</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {filter.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt.value]
                    : selected.filter((item) => item !== opt.value);
                  onChange(next.length ? next : undefined);
                }}
                className="accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (filter.filterType === "dropdown_multiselect") {
    const selected = Array.isArray(value) ? value : value ? [String(value)] : [];
    return (
      <div>
        <h4 className={`${filterFieldTitleClass} mb-2`}>{filter.label}</h4>
        <CheckboxMultiSelectDropdown
          options={filter.options.map((opt) => ({ value: opt.value, label: opt.label }))}
          selected={selected}
          onChange={(next) => onChange(next.length ? next : undefined)}
          placeholder="Все"
          searchPlaceholder="Поиск..."
          showSearch={filter.options.length > 6}
        />
      </div>
    );
  }

  if (filter.filterType === "dropdown") {
    return (
      <div>
        <h4 className={`${filterFieldTitleClass} mb-2`}>{filter.label}</h4>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-full h-10 px-3 bg-input border border-border rounded text-sm"
        >
          <option value="">Все</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}

export function countAttributeFilters(values: AttributeFilterState) {
  return Object.values(values).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return count + 1;
  }, 0);
}

export function buildAttributeQuery(values: AttributeFilterState): string {
  const params = new URLSearchParams();
  for (const [attributeId, value] of Object.entries(values)) {
    if (typeof value === "boolean") {
      if (value) params.set(`attr.${attributeId}`, "true");
    } else if (typeof value === "string") {
      params.set(`attr.${attributeId}`, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        params.append(`attr.${attributeId}`, item);
      }
    } else if (value && typeof value === "object") {
      if (value.min != null) params.set(`attr.${attributeId}.min`, String(value.min));
      if (value.max != null) params.set(`attr.${attributeId}.max`, String(value.max));
    }
  }
  return params.toString();
}
