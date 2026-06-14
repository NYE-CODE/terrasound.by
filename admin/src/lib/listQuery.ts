export interface DateRangeFilters {
  dateFrom?: string;
  dateTo?: string;
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

export { formatDateInput } from "./dateRange";
