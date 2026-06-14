import type { OrderStatus } from "../lib/api";
import { ORDER_STATUS_STYLES } from "../lib/orderStatus";

export function statusBadgeClass(status: OrderStatus) {
  return `inline-flex px-2.5 py-1 rounded text-xs font-medium ${ORDER_STATUS_STYLES[status]}`;
}
