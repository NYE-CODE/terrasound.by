import { useEffect, useRef, useState } from "react";
import { AdminListToolbar } from "../components/AdminListToolbar";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { PAGE_SIZE } from "../hooks/usePagination";
import { inputClass } from "../lib/formStyles";
import { reportActionError, reportLoadError } from "../lib/formError";
import { api, type InstallationRequest } from "../lib/api";

const selectClass = `${inputClass} w-auto min-w-[12rem]`;

const emptyFilters = {
  search: "",
  service: "",
  dateFrom: "",
  dateTo: "",
};

export function InstallationRequestsPage() {
  const { token } = useAuth();
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
    if (!token) return;
    api.installationRequestServices(token).then(setServices).catch(reportLoadError);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (prevFilterSignature.current !== filterSignature) {
      prevFilterSignature.current = filterSignature;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const offset = (page - 1) * PAGE_SIZE;
    api
      .installationRequests(token, { limit: PAGE_SIZE, offset, ...listParams })
      .then((result) => {
        setRequests(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  }, [token, page, filterSignature]);

  const remove = async (requestId: string) => {
    if (!token || !confirm("Удалить заявку?")) return;
    try {
      await api.deleteInstallationRequest(token, requestId);
      const offset = (page - 1) * PAGE_SIZE;
      const result = await api.installationRequests(token, { limit: PAGE_SIZE, offset, ...listParams });
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
    if (!token) return;
    setExporting(true);
    try {
      await api.exportInstallationRequests(token, listParams);
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
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={resetFilters}
        onExport={exportCsv}
        exporting={exporting}
        totalItems={totalItems}
        totalLabel="Найдено заявок"
      >
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={selectClass}
          aria-label="Услуга"
        >
          <option value="">Все услуги</option>
          {services.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
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
