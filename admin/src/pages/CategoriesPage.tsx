import { useEffect, useState } from "react";
import { CategoryDeleteDialog } from "../components/CategoryDeleteDialog";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { RowActions } from "../components/RowActions";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type CategoryAdmin } from "../lib/api";
import { resolveMediaUrl } from "../lib/mediaUrl";

export function CategoriesPage() {
  const { status } = useAuth();
  const [items, setItems] = useState<CategoryAdmin[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CategoryAdmin | null>(null);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (status !== "authenticated") return;
    api.categories().then(setItems).catch(reportLoadError);
  };

  useEffect(load, [status]);

  const remove = async (id: string) => {
    if (status !== "authenticated") return;
    const item = items.find((entry) => entry.id === id);
    if (!item) return;

    if (item.productCount > 0) {
      setDeleteTarget(item);
      return;
    }

    if (!confirm(`Удалить категорию «${item.name}»?`)) return;
    try {
      await api.deleteCategory(id);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Категории" createTo="/categories/new" createLabel="Добавить категорию" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img src={resolveMediaUrl(item.imageUrl)} alt={item.name} className="w-16 h-16 rounded object-cover shrink-0" />
              <div className="min-w-0">
                <div className="font-heading">{item.name}</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {item.id} · {item.productCount} товар(ов)
                </div>
              </div>
            </div>
            <RowActions editTo={`/categories/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Категорий пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />

      {deleteTarget ? (
        <CategoryDeleteDialog
          category={deleteTarget}
          otherCategories={items.filter((item) => item.id !== deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
          onDeleted={load}
        />
      ) : null}
    </div>
  );
}
