import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import type { OrderStatus } from "../../lib/api";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "../../lib/orderStatus";
import { statusBadgeClass } from "../../lib/statusBadge";
import { FILTER_DROPDOWN_ESTIMATED_WIDTH, useFloatingPosition } from "../../hooks/useFloatingPosition";

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  className?: string;
}

export function OrderStatusSelect({ value, onChange, className = "" }: OrderStatusSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const menuStyle = useFloatingPosition({
    open,
    triggerRef,
    floatingRef: menuRef,
    estimatedWidth: FILTER_DROPDOWN_ESTIMATED_WIDTH,
    deps: [value],
  });

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const selectStatus = (status: OrderStatus) => {
    onChange(status);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${statusBadgeClass(value)} items-center gap-1.5 hover:opacity-90 transition-opacity`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        {ORDER_STATUS_LABELS[value]}
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label="Статус заказа"
              style={menuStyle}
              className="min-w-[11.5rem] rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-2xl"
            >
              {ORDER_STATUSES.map((status) => {
                const selected = status === value;

                return (
                  <button
                    key={status}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectStatus(status)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                      selected ? "bg-[#222]" : "hover:bg-[#222]"
                    }`}
                  >
                    <span className={statusBadgeClass(status)}>{ORDER_STATUS_LABELS[status]}</span>
                    {selected ? <Check size={14} className="text-[var(--accent)] shrink-0" /> : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
