import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type InstallationRequest } from "../lib/api";

export function InstallationRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<InstallationRequest[]>([]);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(requests);

  const load = () => {
    if (!token) return;
    api.installationRequests(token).then(setRequests).catch(reportLoadError);
  };

  useEffect(load, [token]);

  const remove = async (requestId: string) => {
    if (!token || !confirm("Удалить заявку?")) return;
    try {
      await api.deleteInstallationRequest(token, requestId);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Заявки на установку" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
            <tr>
              <th className="text-left p-4 font-medium">Имя</th>
              <th className="text-left p-4 font-medium">Телефон</th>
              <th className="text-left p-4 font-medium">Автомобиль</th>
              <th className="text-left p-4 font-medium">Услуга</th>
              <th className="text-left p-4 font-medium">Дата</th>
              <th className="text-left p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[#1f1f1f]">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.phone}</td>
                <td className="p-4">{item.carModel}</td>
                <td className="p-4">{item.service}</td>
                <td className="p-4 text-[var(--muted-foreground)]">
                  {new Date(item.createdAt).toLocaleString("ru-RU")}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-[var(--destructive)] hover:underline"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="p-6 text-[var(--muted-foreground)]">Заявок пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
