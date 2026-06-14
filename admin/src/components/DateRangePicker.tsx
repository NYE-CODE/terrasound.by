import { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DATE_RANGE_PRESETS,
  addMonths,
  buildCalendarWeeks,
  detectDatePreset,
  formatDateInput,
  formatDateRangeDisplay,
  formatMonthTitle,
  getDatePresetRange,
  isBetweenDays,
  isSameDay,
  parseDateInput,
  startOfDay,
  type DatePresetId,
  WEEKDAY_LABELS,
} from "../lib/dateRange";
import { inputClass } from "../lib/formStyles";

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (dateFrom: string, dateTo: string) => void;
  className?: string;
}

function normalizeRange(from: string, to: string): { dateFrom: string; dateTo: string } {
  if (!from || !to) return { dateFrom: from, dateTo: to };
  if (from <= to) return { dateFrom: from, dateTo: to };
  return { dateFrom: to, dateTo: from };
}

function MonthCalendar({
  month,
  rangeFrom,
  rangeTo,
  onSelect,
}: {
  month: Date;
  rangeFrom: Date | null;
  rangeTo: Date | null;
  onSelect: (date: Date) => void;
}) {
  const weeks = buildCalendarWeeks(month);

  return (
    <div>
      <div className="text-center font-heading text-sm mb-3">{formatMonthTitle(month)}</div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs text-[var(--muted-foreground)] py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map(({ date, inMonth }) => {
              const inRange =
                rangeFrom && rangeTo ? isBetweenDays(date, rangeFrom, rangeTo) : false;
              const isStart = rangeFrom ? isSameDay(date, rangeFrom) : false;
              const isEnd = rangeTo ? isSameDay(date, rangeTo) : false;
              const isEndpoint = isStart || isEnd;

              return (
                <button
                  key={formatDateInput(date)}
                  type="button"
                  disabled={!inMonth}
                  onClick={() => onSelect(date)}
                  className={`h-8 w-8 mx-auto rounded text-sm transition-colors ${
                    !inMonth
                      ? "text-transparent pointer-events-none"
                      : isEndpoint
                        ? "bg-[var(--accent)] text-[#0e0e0f] font-medium"
                        : inRange
                          ? "bg-[#2a2a2a] text-[var(--foreground)]"
                          : "text-[var(--foreground)] hover:bg-[#222]"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DateRangePicker({ dateFrom, dateTo, onChange, className = "" }: DateRangePickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(dateFrom);
  const [draftTo, setDraftTo] = useState(dateTo);
  const [activePreset, setActivePreset] = useState<DatePresetId | null>(null);
  const [viewMonth, setViewMonth] = useState(() => startOfDay(new Date()));
  const [pendingStart, setPendingStart] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) {
      setDraftFrom(dateFrom);
      setDraftTo(dateTo);
      setActivePreset(detectDatePreset(dateFrom, dateTo));
      setPendingStart(null);
      const anchor = parseDateInput(dateFrom) ?? startOfDay(new Date());
      setViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    }
  }, [open, dateFrom, dateTo]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const applyRange = (from: string, to: string, preset: DatePresetId | null) => {
    const normalized = normalizeRange(from, to);
    setDraftFrom(normalized.dateFrom);
    setDraftTo(normalized.dateTo);
    setActivePreset(preset);
    onChange(normalized.dateFrom, normalized.dateTo);
  };

  const handlePreset = (presetId: DatePresetId) => {
    if (presetId === "custom") {
      setActivePreset("custom");
      setPendingStart(null);
      return;
    }
    const range = getDatePresetRange(presetId);
    applyRange(range.dateFrom, range.dateTo, presetId);
    const anchor = parseDateInput(range.dateFrom) ?? startOfDay(new Date());
    setViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    setPendingStart(null);
  };

  const handleDaySelect = (date: Date) => {
    setActivePreset("custom");

    if (!pendingStart) {
      setPendingStart(date);
      setDraftFrom(formatDateInput(date));
      setDraftTo("");
      return;
    }

    if (isSameDay(pendingStart, date)) {
      const iso = formatDateInput(date);
      applyRange(iso, iso, "custom");
      setPendingStart(null);
      return;
    }

    const from = formatDateInput(pendingStart);
    const to = formatDateInput(date);
    applyRange(from, to, "custom");
    setPendingStart(null);
  };

  const rangeFrom = parseDateInput(draftFrom);
  const rangeTo = parseDateInput(pendingStart ? "" : draftTo) ?? (pendingStart ? pendingStart : null);

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${inputClass} min-w-[12rem] inline-flex items-center gap-2 text-left`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Calendar size={16} className="text-[var(--muted-foreground)] shrink-0" />
        <span className={dateFrom || dateTo ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}>
          {formatDateRangeDisplay(dateFrom, dateTo)}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-labelledby={listboxId}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden"
        >
          <div className="w-44 border-r border-[var(--border)] p-2 space-y-1">
            <div id={listboxId} className="sr-only">
              Выбор периода
            </div>
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activePreset === preset.id
                    ? "bg-[var(--accent)] text-[#0e0e0f] font-medium"
                    : "text-[var(--muted-foreground)] hover:bg-[#222] hover:text-[var(--foreground)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMonth((month) => addMonths(month, -1))}
                className="p-2 rounded hover:bg-[#222] text-[var(--muted-foreground)] shrink-0"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-6">
                <MonthCalendar
                  month={viewMonth}
                  rangeFrom={rangeFrom}
                  rangeTo={rangeTo}
                  onSelect={handleDaySelect}
                />
                <MonthCalendar
                  month={addMonths(viewMonth, 1)}
                  rangeFrom={rangeFrom}
                  rangeTo={rangeTo}
                  onSelect={handleDaySelect}
                />
              </div>

              <button
                type="button"
                onClick={() => setViewMonth((month) => addMonths(month, 1))}
                className="p-2 rounded hover:bg-[#222] text-[var(--muted-foreground)] shrink-0"
                aria-label="Следующий месяц"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
