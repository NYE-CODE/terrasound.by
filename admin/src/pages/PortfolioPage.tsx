import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type PortfolioWork } from "../lib/api";

export function PortfolioPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<PortfolioWork[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (!token) return;
    api.portfolioWorks(token).then(setItems).catch(reportLoadError);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token || !confirm("Удалить работу?")) return;
    try {
      await api.deletePortfolioWork(token, id);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Наши работы" createTo="/portfolio/new" createLabel="Добавить работу" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img src={item.imageUrl} alt={item.title} className="w-20 h-14 rounded object-cover shrink-0" />
              <div className="min-w-0">
                <div className="font-heading truncate">{item.title}</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Порядок: {item.sortOrder}
                  {!item.published && " · Скрыта"}
                </div>
              </div>
            </div>
            <RowActions editTo={`/portfolio/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Работ пока нет</p>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
