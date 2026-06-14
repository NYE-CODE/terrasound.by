import { Download, RotateCcw, Search } from "lucide-react";
import { DATE_PRESETS, type DatePresetId, getDatePresetRange } from "../lib/listQuery";
import { inputClass } from "../lib/formStyles";

interface AdminListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
  totalItems: number;
  totalLabel: string;
  children?: React.ReactNode;
}

const selectClass = `${inputClass} w-auto min-w-[10rem]`;

export function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Поиск…",
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
  onExport,
  exporting = false,
  totalItems,
  totalLabel,
  children,
}: AdminListToolbarProps) {
  const applyPreset = (id: DatePresetId) => {
    const range = getDatePresetRange(id);
    onDateFromChange(range.dateFrom);
    onDateToChange(range.dateTo);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${inputClass} pl-9`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {children}

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={selectClass}
            aria-label="Дата с"
          />
          <span className="text-sm text-[var(--muted-foreground)]">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className={selectClass}
            aria-label="Дата по"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="h-9 px-3 rounded border border-[var(--border)] text-xs font-heading uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222] transition-colors"
            >
              {preset.label}
            </button>
          ))}

          <button
            type="button"
            onClick={onReset}
            className="h-9 px-3 rounded border border-[var(--border)] text-xs font-heading uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[#222] transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Сбросить
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {totalLabel}: {totalItems}
          </span>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="h-9 px-4 rounded bg-[var(--accent)] text-[#0e0e0f] text-xs font-heading uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Download size={14} />
            {exporting ? "Экспорт…" : "Экспорт CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
