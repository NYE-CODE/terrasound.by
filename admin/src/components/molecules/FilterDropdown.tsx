import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { FILTER_DROPDOWN_ESTIMATED_WIDTH, useFloatingPosition } from "../../hooks/useFloatingPosition";

export interface FilterDropdownOption {
  value: string;
  label: string;
  badgeClass?: string;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  emptyLabel: string;
  ariaLabel: string;
  align?: "left" | "right";
  className?: string;
}

export function FilterDropdown({
  value,
  onChange,
  options,
  emptyLabel,
  ariaLabel,
  align = "left",
  className = "",
}: FilterDropdownProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const menuStyle = useFloatingPosition({
    open,
    triggerRef,
    floatingRef: menuRef,
    align,
    estimatedWidth: FILTER_DROPDOWN_ESTIMATED_WIDTH,
    deps: [value, align, options.length],
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

  const selectValue = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const selected = options.find((option) => option.value === value);
  const triggerLabel = selected?.label ?? emptyLabel;

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="h-11 w-full min-w-0 px-3 bg-[var(--input)] border border-[var(--border)] rounded inline-flex items-center justify-between gap-2 text-left text-sm hover:border-[var(--accent)]/40 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        {selected?.badgeClass ? (
          <span className={`${selected.badgeClass} truncate`}>{triggerLabel}</span>
        ) : (
          <span className="truncate text-[var(--muted-foreground)]">{triggerLabel}</span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              style={menuStyle}
              className="w-max min-w-[11.5rem] rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-2xl"
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value || "__all__"}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectValue(option.value)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-2 rounded text-left transition-colors ${
                      isSelected ? "bg-[#222]" : "hover:bg-[#222]"
                    }`}
                  >
                    {option.badgeClass ? (
                      <span className={option.badgeClass}>{option.label}</span>
                    ) : (
                      <span className="text-sm text-[var(--foreground)]">{option.label}</span>
                    )}
                    {isSelected ? <Check size={14} className="text-[var(--accent)] shrink-0" /> : null}
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
