import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminListToolbar } from "../components/molecules/AdminListToolbar";
import { ServiceFilter } from "../components/molecules/OrderFilters";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { PAGE_SIZE } from "../hooks/usePagination";
import { reportActionError, reportLoadError } from "../lib/formError";
import { iconButtonClass } from "../lib/iconButton";
import { api, type InstallationRequest } from "../lib/api";

const emptyFilters = {
  search: "",
  service: "",
  dateFrom: "",
  dateTo: "",
};

export function InstallationRequestsPage() {
  const { status } = useAuth();
  const [requests, setRequests] = useState<InstallationRequest[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState(emptyFilters.search);
  const [service, setService] = useState(emptyFilters.service);
  const [dateFrom, setDateFrom] = useState(emptyFilters.dateFrom);
  const [dateTo, setDateTo] = useState(emptyFilters.dateTo);
  const debouncedSearch = useDebouncedValue(search);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const filterSignature = [debouncedSearch, service, dateFrom, dateTo].join("\0");
  const prevFilterSignature = useRef(filterSignature);

  const listParams = {
    q: debouncedSearch || undefined,
    service: service || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    api.installationRequestServices().then(setServices).catch(reportLoadError);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (prevFilterSignature.current !== filterSignature) {
      prevFilterSignature.current = filterSignature;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const offset = (page - 1) * PAGE_SIZE;
    api
      .installationRequests({ limit: PAGE_SIZE, offset, ...listParams })
      .then((result) => {
        setRequests(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  }, [status, page, filterSignature]);

  const remove = async (requestId: string) => {
    if (status !== "authenticated" || !confirm("Удалить заявку?")) return;
    try {
      await api.deleteInstallationRequest(requestId);
      const offset = (page - 1) * PAGE_SIZE;
      const result = await api.installationRequests({ limit: PAGE_SIZE, offset, ...listParams });
      setRequests(result.data);
      setTotalItems(result.meta.total);
      if (result.data.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      reportActionError(error);
    }
  };

  const resetFilters = () => {
    setSearch(emptyFilters.search);
    setService(emptyFilters.service);
    setDateFrom(emptyFilters.dateFrom);
    setDateTo(emptyFilters.dateTo);
  };

  const exportCsv = async () => {
    if (status !== "authenticated") return;
    setExporting(true);
    try {
      await api.exportInstallationRequests(listParams);
    } catch (error) {
      reportActionError(error, "Не удалось экспортировать заявки.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Заявки на установку" />

      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Имя, телефон, авто, услуга…"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateRangeChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        onReset={resetFilters}
        onExport={exportCsv}
        exporting={exporting}
        totalItems={totalItems}
        totalLabel="Найдено заявок"
      >
        <ServiceFilter value={service} onChange={setService} services={services} />
      </AdminListToolbar>

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
            {requests.map((item) => (
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
                    title="Удалить"
                    aria-label="Удалить заявку"
                    className={`${iconButtonClass} hover:text-[var(--destructive)]`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="p-6 text-[var(--muted-foreground)]">Заявки не найдены</p>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
