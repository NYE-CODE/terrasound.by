import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type AttributeDef } from "../lib/api";

const VALUE_TYPE_LABELS: Record<string, string> = {
  text: "Текст",
  number: "Число",
  boolean: "Да / нет",
  enum: "Список",
};

export function AttributesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<AttributeDef[]>([]);

  const load = () => {
    if (!token) return;
    api.attributes(token).then(setItems).catch(console.error);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await api.deleteAttribute(token, id);
      load();
    } catch (error) {
      if (error instanceof ApiError) alert(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Атрибуты" createTo="/attributes/new" createLabel="Добавить атрибут" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        Общий справочник характеристик (тип, мощность, Bluetooth…). Привязка к категории и настройка
        фильтров — в форме редактирования категории.
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-heading">{item.label}</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {item.id} · {VALUE_TYPE_LABELS[item.valueType] ?? item.valueType}
                {item.unit ? ` · ${item.unit}` : ""}
                {item.options.length > 0 && ` · ${item.options.map((o) => o.label).join(", ")}`}
              </div>
            </div>
            <RowActions editTo={`/attributes/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && <p className="text-[var(--muted-foreground)]">Атрибутов пока нет</p>}
      </div>
    </div>
  );
}
