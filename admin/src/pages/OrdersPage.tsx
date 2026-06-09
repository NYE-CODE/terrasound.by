import { Fragment, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { api, type Order, type OrderStatus } from "../lib/api";

const statuses: OrderStatus[] = ["new", "confirmed", "completed", "cancelled"];

export function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(orders);

  const load = () => {
    if (!token) return;
    api.orders(token).then(setOrders).catch(console.error);
  };

  useEffect(load, [token]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    await api.updateOrderStatus(token, orderId, status);
    load();
  };

  return (
    <div>
      <PageHeader title="Заказы" />

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
            {paginatedItems.map((order) => (
              <Fragment key={order.id}>
                <tr className="border-b border-[var(--border)] hover:bg-[#1f1f1f]">
                  <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                  <td className="p-4">
                    <div>{order.name}</div>
                    <div className="text-[var(--muted-foreground)]">{order.phone}</div>
                  </td>
                  <td className="p-4">{order.total.toFixed(2)} BYN</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4 text-[var(--muted-foreground)]">
                    {new Date(order.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="text-[var(--accent)] hover:underline mr-3"
                    >
                      {expandedId === order.id ? "Скрыть" : "Подробнее"}
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-[var(--input)] border border-[var(--border)] rounded px-2 py-1"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr key={`${order.id}-details`} className="border-b border-[var(--border)] bg-[#141414]">
                    <td colSpan={6} className="p-6">
                      <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                          <h3 className="font-heading mb-2">Контакты</h3>
                          <p>{order.email}</p>
                          <p>{order.city}, {order.address}</p>
                          <p className="mt-2">Оплата: {order.paymentMethod}</p>
                          {order.installationConsultationRequested && (
                            <p className="mt-2 text-[var(--accent)]">Нужна консультация по установке</p>
                          )}
                        </div>
                        <div>
                          <h3 className="font-heading mb-2">Автомобиль</h3>
                          <p>{order.carMake} {order.carModel} {order.carYear}</p>
                          {order.carComment && <p className="text-[var(--muted-foreground)] mt-2">{order.carComment}</p>}
                        </div>
                      </div>
                      <div className="mt-6">
                        <h3 className="font-heading mb-2">Товары</h3>
                        <ul className="space-y-2 text-sm">
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.productBrand} {item.productName} × {item.quantity} — {item.unitPrice.toFixed(2)} BYN
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
          <p className="p-6 text-[var(--muted-foreground)]">Заказов пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
