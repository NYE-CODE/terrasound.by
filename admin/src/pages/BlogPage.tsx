import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { reportActionError } from "../lib/formError";
import { api, type BlogPost } from "../lib/api";

export function BlogPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<BlogPost[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (!token) return;
    api.blogPosts(token).then(setItems).catch(console.error);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token || !confirm("Удалить статью?")) return;
    try {
      await api.deleteBlogPost(token, id);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Блог" createTo="/blog/new" createLabel="Добавить статью" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex justify-between gap-4">
            <div>
              <div className="font-heading">{item.title}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{item.category}</div>
            </div>
            <RowActions editTo={`/blog/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Статей пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
