import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { reportActionError } from "../lib/formError";
import { api, type InstallationService } from "../lib/api";

export function ServicesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<InstallationService[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (!token) return;
    api.services(token).then(setItems).catch(console.error);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token || !confirm("Удалить услугу?")) return;
    try {
      await api.deleteService(token, id);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Услуги установки" createTo="/services/new" createLabel="Добавить услугу" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex justify-between gap-4">
            <div>
              <div className="font-heading">{item.title}</div>
              <div className="text-sm text-[var(--muted-foreground)] line-clamp-2">{item.description}</div>
            </div>
            <RowActions editTo={`/services/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Услуг пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
