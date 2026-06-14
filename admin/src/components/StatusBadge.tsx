import type { OrderStatus } from "../lib/api";
import { ORDER_STATUS_LABELS } from "../lib/orderStatus";
import { statusBadgeClass } from "../lib/statusBadge";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={statusBadgeClass(status)}>{ORDER_STATUS_LABELS[status]}</span>;
}
