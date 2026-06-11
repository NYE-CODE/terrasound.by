import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { reportActionError } from "../lib/formError";
import { api, type Brand } from "../lib/api";

export function BrandsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Brand[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (!token) return;
    api.brands(token).then(setItems).catch(console.error);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token || !confirm("Удалить бренд?")) return;
    try {
      await api.deleteBrand(token, id);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Бренды" createTo="/brands/new" createLabel="Добавить бренд" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex justify-between gap-4">
            <div>
              <div className="font-heading">{item.name}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{item.country} · с {item.since}</div>
            </div>
            <RowActions editTo={`/brands/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Брендов пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
