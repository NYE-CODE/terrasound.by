import type { CategoryAttributeSchema } from "../lib/api";
import { inputClass } from "../lib/formStyles";
import { parseOptionalNumber } from "../lib/numbers";

interface ProductAttributeFieldsProps {
  schema: CategoryAttributeSchema[];
  values: Record<string, string | number | boolean | null>;
  onChange: (attributeId: string, value: string | number | boolean | null) => void;
}

export function ProductAttributeFields({ schema, values, onChange }: ProductAttributeFieldsProps) {
  if (schema.length === 0) return null;

  const groups = schema.reduce<Record<string, CategoryAttributeSchema[]>>((acc, field) => {
    const key = field.groupLabel || "";
    acc[key] = acc[key] || [];
    acc[key].push(field);
    return acc;
  }, {});

  return (
    <div className="md:col-span-2 space-y-6 border-t border-[var(--border)] pt-4">
      <div>
        <h3 className="font-heading text-sm uppercase tracking-wider">Характеристики товара</h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Поля со звёздочкой обязательны для выбранной категории.
        </p>
      </div>
      {Object.entries(groups).map(([group, fields]) => (
        <div key={group || "default"} className="space-y-4">
          {group && <div className="text-sm text-[var(--muted-foreground)]">{group}</div>}
          <div className="grid md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.attributeId}>
                <label className="block text-sm mb-1">
                  {field.label}
                  {field.unit ? ` (${field.unit})` : ""}
                  {field.required && (
                    <span className="text-red-400" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  )}
                </label>
                {field.valueType === "boolean" ? (
                  <label className="flex items-center gap-2 text-sm h-10">
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.attributeId])}
                      onChange={(e) => onChange(field.attributeId, e.target.checked)}
                    />
                    Да
                  </label>
                ) : field.valueType === "enum" ? (
                  <select
                    value={String(values[field.attributeId] ?? "")}
                    onChange={(e) => onChange(field.attributeId, e.target.value || null)}
                    className={inputClass}
                    required={field.required}
                  >
                    <option value="">—</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.valueType === "number" ? (
                  <input
                    type="number"
                    step="any"
                    value={values[field.attributeId] ?? ""}
                    onChange={(e) => onChange(field.attributeId, parseOptionalNumber(e.target.value))}
                    className={inputClass}
                    required={field.required}
                  />
                ) : (
                  <input
                    type="text"
                    value={String(values[field.attributeId] ?? "")}
                    onChange={(e) => onChange(field.attributeId, e.target.value)}
                    className={inputClass}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
