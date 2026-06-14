import { Fragment, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { AdminListToolbar } from "../components/molecules/AdminListToolbar";
import { FilterSelect } from "../components/atoms/FilterSelect";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { PAGE_SIZE } from "../hooks/usePagination";
import { reportActionError, reportLoadError } from "../lib/formError";
import { iconButtonClass } from "../lib/iconButton";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "../lib/orderStatus";
import { api, type Order, type OrderStatus } from "../lib/api";

const emptyFilters = {
  search: "",
  status: "" as OrderStatus | "",
  paymentMethod: "" as PaymentMethod | "",
  dateFrom: "",
  dateTo: "",
};

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState(emptyFilters.search);
  const [status, setStatus] = useState<OrderStatus | "">(emptyFilters.status);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(emptyFilters.paymentMethod);
  const [dateFrom, setDateFrom] = useState(emptyFilters.dateFrom);
  const [dateTo, setDateTo] = useState(emptyFilters.dateTo);
  const debouncedSearch = useDebouncedValue(search);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const filterSignature = [debouncedSearch, status, paymentMethod, dateFrom, dateTo].join("\0");
  const prevFilterSignature = useRef(filterSignature);

  const listParams = {
    q: debouncedSearch || undefined,
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

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
      .orders(token, { limit: PAGE_SIZE, offset, ...listParams })
      .then((result) => {
        setOrders(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  }, [token, page, filterSignature]);

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (!token) return;
    try {
      await api.updateOrderStatus(token, orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
      );
    } catch (error) {
      reportActionError(error, "Не удалось обновить статус заказа.");
    }
  };

  const remove = async (orderId: string) => {
    if (!token || !confirm("Удалить заказ?")) return;
    try {
      await api.deleteOrder(token, orderId);
      if (expandedId === orderId) setExpandedId(null);
      const offset = (page - 1) * PAGE_SIZE;
      const result = await api.orders(token, { limit: PAGE_SIZE, offset, ...listParams });
      setOrders(result.data);
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
    setStatus(emptyFilters.status);
    setPaymentMethod(emptyFilters.paymentMethod);
    setDateFrom(emptyFilters.dateFrom);
    setDateTo(emptyFilters.dateTo);
  };

  const exportCsv = async () => {
    if (!token) return;
    setExporting(true);
    try {
      await api.exportOrders(token, listParams);
    } catch (error) {
      reportActionError(error, "Не удалось экспортировать заказы.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Заказы" />

      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Имя, телефон, email, город, ID…"
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
        totalLabel="Найдено заказов"
        filterColumns={4}
      >
        <FilterSelect
          value={status}
          onChange={(value) => setStatus(value as OrderStatus | "")}
          ariaLabel="Статус"
        >
          <option value="">Все статусы</option>
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {ORDER_STATUS_LABELS[item]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value as PaymentMethod | "")}
          ariaLabel="Способ оплаты"
        >
          <option value="">Вся оплата</option>
          {PAYMENT_METHODS.map((item) => (
            <option key={item} value={item}>
              {PAYMENT_METHOD_LABELS[item]}
            </option>
          ))}
        </FilterSelect>
      </AdminListToolbar>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
            <tr>
              <th className="text-left p-4 font-medium">ID</th>
              <th className="text-left p-4 font-medium">Клиент</th>
              <th className="text-left p-4 font-medium">Сумма</th>
              <th className="text-left p-4 font-medium">Статус</th>
              <th className="text-left p-4 font-medium">Дата</th>
              <th className="text-left p-4 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Fragment key={order.id}>
                <tr className="border-b border-[var(--border)] hover:bg-[#1f1f1f]">
                  <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                  <td className="p-4">
                    <div>{order.name}</div>
                    <div className="text-[var(--muted-foreground)]">{order.phone}</div>
                  </td>
                  <td className="p-4">{order.total.toFixed(2)} BYN</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 text-[var(--muted-foreground)]">
                    {new Date(order.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        title={expandedId === order.id ? "Скрыть" : "Подробнее"}
                        aria-label={expandedId === order.id ? "Скрыть детали заказа" : "Подробнее о заказе"}
                        className={`${iconButtonClass} hover:text-[var(--accent)]`}
                      >
                        {expandedId === order.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-[var(--input)] border border-[var(--border)] rounded px-2 py-1 ml-1"
                        aria-label="Сменить статус заказа"
                      >
                        {ORDER_STATUSES.map((item) => (
                          <option key={item} value={item}>
                            {ORDER_STATUS_LABELS[item]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => remove(order.id)}
                        title="Удалить"
                        aria-label="Удалить заказ"
                        className={`${iconButtonClass} hover:text-[var(--destructive)]`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr className="border-b border-[var(--border)] bg-[#141414]">
                    <td colSpan={6} className="p-6">
                      <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                          <h3 className="font-heading mb-2">Контакты</h3>
                          <p>{order.email}</p>
                          <p>
                            {order.city}, {order.address}
                          </p>
                          <p className="mt-2">
                            Оплата: {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-heading mb-2">Автомобиль</h3>
                          <p>
                            {order.carMake} {order.carModel} {order.carYear}
                          </p>
                          {order.carComment && (
                            <p className="text-[var(--muted-foreground)] mt-2">{order.carComment}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-6">
                        <h3 className="font-heading mb-2">Товары</h3>
                        <ul className="space-y-2 text-sm">
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.productBrand} {item.productName} × {item.quantity} —{" "}
                              {item.unitPrice.toFixed(2)} BYN
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-6 text-[var(--muted-foreground)]">Заказы не найдены</p>
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
