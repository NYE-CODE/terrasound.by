import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type AttributeDef } from "../lib/api";
import { FILTER_TYPE_LABELS, VALUE_TYPE_LABELS } from "../lib/filterTypes";

export function AttributesPage() {
  const { status } = useAuth();
  const [items, setItems] = useState<AttributeDef[]>([]);

  const load = () => {
    if (status !== "authenticated") return;
    api.attributes().then(setItems).catch(reportLoadError);
  };

  useEffect(load, [status]);

  const remove = async (id: string) => {
    if (status !== "authenticated" || !confirm("Удалить атрибут?")) return;
    try {
      await api.deleteAttribute(id);
      load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const cascade = confirm(
          `${error.message}\n\nОчистить значения у всех товаров, отвязать от категорий и удалить атрибут?`,
        );
        if (!cascade) return;
        try {
          await api.deleteAttribute(id, { cascade: true });
          load();
        } catch (cascadeError) {
          reportActionError(cascadeError);
        }
        return;
      }
      reportActionError(error);
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
                {item.filterType ? ` · ${FILTER_TYPE_LABELS[item.filterType] ?? item.filterType}` : ""}
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
