import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { useAuth } from "../context/AuthContext";
import { ApiError, api, type AttributeDef } from "../lib/api";

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

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-heading">{item.label}</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {item.id} · {item.valueType}
                {item.unit ? ` · ${item.unit}` : ""}
                {item.options.length > 0 ? ` · ${item.options.length} вариантов` : ""}
              </div>
            </div>
            <RowActions editTo={`/attributes/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && <p className="text-[var(--muted-foreground)]">Атрибутов пока нет</p>}
      </div>

      <p className="mt-6 text-sm text-[var(--muted-foreground)]">
        Привязка атрибутов к категориям — в разделе{" "}
        <Link to="/categories" className="text-[var(--accent)] hover:underline">
          Категории
        </Link>
        .
      </p>
    </div>
  );
}
