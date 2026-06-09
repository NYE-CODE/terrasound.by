import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { api, type TeamMember } from "../lib/api";

export function TeamPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<TeamMember[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(items);

  const load = () => {
    if (!token) return;
    api.teamMembers(token).then(setItems).catch(console.error);
  };

  useEffect(load, [token]);

  const remove = async (id: string) => {
    if (!token || !confirm("Удалить сотрудника?")) return;
    await api.deleteTeamMember(token, id);
    load();
  };

  return (
    <div>
      <PageHeader title="Команда" createTo="/team/new" createLabel="Добавить сотрудника" />

      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded object-cover" />
              <div>
                <div className="font-heading">{item.name}</div>
                <div className="text-sm text-[var(--muted-foreground)]">{item.specialty}</div>
              </div>
            </div>
            <RowActions editTo={`/team/${item.id}/edit`} onDelete={() => remove(item.id)} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Сотрудников пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
