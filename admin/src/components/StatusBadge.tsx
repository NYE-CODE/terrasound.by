import type { OrderStatus } from "../lib/api";
import { ORDER_STATUS_LABELS } from "../lib/orderStatus";

const styles: Record<OrderStatus, string> = {
  new: "bg-[#E4AF0033] text-[#ffb07a]",
  confirmed: "bg-[#3b82f633] text-[#93c5fd]",
  completed: "bg-[#22c55e33] text-[#86efac]",
  cancelled: "bg-[#d4183d33] text-[#fca5a5]",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
