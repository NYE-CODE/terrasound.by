import type { OrderStatus } from "../lib/api";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  completed: "Выполнен",
  cancelled: "Отменён",
};

export const ORDER_STATUSES: OrderStatus[] = ["new", "confirmed", "completed", "cancelled"];

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-[#E4AF0033] text-[#ffb07a]",
  confirmed: "bg-[#3b82f633] text-[#93c5fd]",
  completed: "bg-[#22c55e33] text-[#86efac]",
  cancelled: "bg-[#d4183d33] text-[#fca5a5]",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Наличные",
  card: "Карта",
  bank: "Безналичный расчёт",
};

export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "card", "bank"];
