import { Download, RotateCcw } from "lucide-react";
import { SearchInput } from "../atoms/SearchInput";
import { DateRangePicker } from "./DateRangePicker";

interface AdminListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dateFrom: string;
  dateTo: string;
  onDateRangeChange: (dateFrom: string, dateTo: string) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
  totalItems: number;
  totalLabel: string;
  filterColumns?: 3 | 4;
  children?: React.ReactNode;
}

const filterGridClass: Record<3 | 4, string> = {
  3: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center min-w-0",
  4: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center min-w-0",
};

export function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Поиск…",
  dateFrom,
  dateTo,
  onDateRangeChange,
  onReset,
  onExport,
  exporting = false,
  totalItems,
  totalLabel,
  filterColumns = 4,
  children,
}: AdminListToolbarProps) {
  return (
    <div className="mb-6 space-y-3 min-w-0">
      <div className={filterGridClass[filterColumns]}>
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

        <div className="contents">{children}</div>

        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={onDateRangeChange}
        />

        <button
          type="button"
          onClick={onReset}
          className="h-9 px-3 rounded border border-[var(--border)] text-xs font-heading uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 justify-self-start xl:justify-self-auto"
        >
          <RotateCcw size={14} />
          Сбросить
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <span className="text-sm text-[var(--muted-foreground)]">
          {totalLabel}: {totalItems}
        </span>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="h-9 px-4 rounded bg-[var(--accent)] text-[#0e0e0f] text-xs font-heading uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Download size={14} />
          {exporting ? "Экспорт…" : "Экспорт CSV"}
        </button>
      </div>
    </div>
  );
}
