import type { OrderStatus } from "../../lib/api";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "../../lib/orderStatus";
import { statusBadgeClass } from "../../lib/statusBadge";
import { FilterDropdown } from "./FilterDropdown";

interface OrderStatusFilterProps {
  value: OrderStatus | "";
  onChange: (value: OrderStatus | "") => void;
}

export function OrderStatusFilter({ value, onChange }: OrderStatusFilterProps) {
  const options = [
    { value: "", label: "Все статусы" },
    ...ORDER_STATUSES.map((status) => ({
      value: status,
      label: ORDER_STATUS_LABELS[status],
      badgeClass: statusBadgeClass(status),
    })),
  ];

  return (
    <FilterDropdown
      value={value}
      onChange={(next) => onChange(next as OrderStatus | "")}
      options={options}
      emptyLabel="Все статусы"
      ariaLabel="Фильтр по статусу"
    />
  );
}

interface PaymentMethodFilterProps {
  value: PaymentMethod | "";
  onChange: (value: PaymentMethod | "") => void;
}

export function PaymentMethodFilter({ value, onChange }: PaymentMethodFilterProps) {
  const options = [
    { value: "", label: "Вся оплата" },
    ...PAYMENT_METHODS.map((method) => ({
      value: method,
      label: PAYMENT_METHOD_LABELS[method],
    })),
  ];

  return (
    <FilterDropdown
      value={value}
      onChange={(next) => onChange(next as PaymentMethod | "")}
      options={options}
      emptyLabel="Вся оплата"
      ariaLabel="Фильтр по способу оплаты"
    />
  );
}
