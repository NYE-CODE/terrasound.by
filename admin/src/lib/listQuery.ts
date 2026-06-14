export interface DateRangeFilters {
  dateFrom?: string;
  dateTo?: string;
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function appendListQueryParams(
  search: URLSearchParams,
  params: Record<string, string | number | undefined | null>,
) {
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    search.set(key, String(value));
  }
}

export type DatePresetId = "today" | "7d" | "30d" | "month";

export function getDatePresetRange(id: DatePresetId): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const dateTo = formatDateInput(today);

  if (id === "today") {
    return { dateFrom: dateTo, dateTo };
  }

  if (id === "7d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { dateFrom: formatDateInput(from), dateTo };
  }

  if (id === "30d") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { dateFrom: formatDateInput(from), dateTo };
  }

  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { dateFrom: formatDateInput(from), dateTo };
}

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "7d", label: "7 дней" },
  { id: "30d", label: "30 дней" },
  { id: "month", label: "Месяц" },
];
