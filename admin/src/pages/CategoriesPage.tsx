import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { RowActions } from "../components/RowActions";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { ApiError, api, type CategoryAdmin } from "../lib/api";

export function CategoriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<CategoryAdmin[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (!token) return;
    api.categories(token).then(setItems).catch(console.error);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token) return;
    const item = items.find((entry) => entry.id === id);
    if (item && item.productCount > 0) {
      alert(
        `Категорию «${item.name}» нельзя удалить: в ней ${item.productCount} товар(ов). Сначала перенесите или удалите товары.`,
      );
      return;
    }
    if (!confirm(`Удалить категорию «${item?.name ?? id}»?`)) return;
    try {
      await api.deleteCategory(token, id);
      load();
    } catch (error) {
      if (error instanceof ApiError) alert(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Категории" createTo="/categories/new" createLabel="Добавить категорию" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded object-cover shrink-0" />
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
    </div>
  );
}
