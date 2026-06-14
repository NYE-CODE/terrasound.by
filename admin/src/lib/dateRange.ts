export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function formatDateDisplay(value: string): string {
  const date = parseDateInput(value);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function formatDateRangeDisplay(dateFrom: string, dateTo: string): string {
  if (!dateFrom && !dateTo) return "Период";
  if (dateFrom && dateTo) {
    return `${formatDateDisplay(dateFrom)} — ${formatDateDisplay(dateTo)}`;
  }
  if (dateFrom) return `с ${formatDateDisplay(dateFrom)}`;
  return `до ${formatDateDisplay(dateTo)}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfWeekMonday(date: Date): Date {
  const value = startOfDay(date);
  const weekday = value.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  value.setDate(value.getDate() + diff);
  return value;
}

export function endOfWeekSunday(date: Date): Date {
  const value = startOfWeekMonday(date);
  value.setDate(value.getDate() + 6);
  return value;
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBetweenDays(date: Date, from: Date, to: Date): boolean {
  const value = startOfDay(date).getTime();
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return value >= Math.min(start, end) && value <= Math.max(start, end);
}

export type DatePresetId =
  | "today"
  | "yesterday"
  | "currentWeek"
  | "lastWeek"
  | "currentMonth"
  | "lastMonth"
  | "custom";

export const DATE_RANGE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "yesterday", label: "Вчера" },
  { id: "currentWeek", label: "Текущая неделя" },
  { id: "lastWeek", label: "Прошлая неделя" },
  { id: "currentMonth", label: "Текущий месяц" },
  { id: "lastMonth", label: "Прошлый месяц" },
  { id: "custom", label: "Свой период" },
];

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export function formatMonthTitle(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function getDatePresetRange(id: Exclude<DatePresetId, "custom">): {
  dateFrom: string;
  dateTo: string;
} {
  const today = startOfDay(new Date());

  if (id === "today") {
    const iso = formatDateInput(today);
    return { dateFrom: iso, dateTo: iso };
  }

  if (id === "yesterday") {
    const day = new Date(today);
    day.setDate(day.getDate() - 1);
    const iso = formatDateInput(day);
    return { dateFrom: iso, dateTo: iso };
  }

  if (id === "currentWeek") {
    return {
      dateFrom: formatDateInput(startOfWeekMonday(today)),
      dateTo: formatDateInput(endOfWeekSunday(today)),
    };
  }

  if (id === "lastWeek") {
    const lastWeekAnchor = new Date(today);
    lastWeekAnchor.setDate(lastWeekAnchor.getDate() - 7);
    return {
      dateFrom: formatDateInput(startOfWeekMonday(lastWeekAnchor)),
      dateTo: formatDateInput(endOfWeekSunday(lastWeekAnchor)),
    };
  }

  if (id === "currentMonth") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      dateFrom: formatDateInput(from),
      dateTo: formatDateInput(endOfMonth(today)),
    };
  }

  const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return {
    dateFrom: formatDateInput(from),
    dateTo: formatDateInput(endOfMonth(from)),
  };
}

export function detectDatePreset(dateFrom: string, dateTo: string): DatePresetId | null {
  if (!dateFrom || !dateTo) return null;
  for (const preset of DATE_RANGE_PRESETS) {
    if (preset.id === "custom") continue;
    const range = getDatePresetRange(preset.id);
    if (range.dateFrom === dateFrom && range.dateTo === dateTo) {
      return preset.id;
    }
  }
  return "custom";
}

export function buildCalendarWeeks(month: Date): Array<Array<{ date: Date; inMonth: boolean }>> {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = startOfWeekMonday(firstOfMonth);
  const weeks: Array<Array<{ date: Date; inMonth: boolean }>> = [];

  for (let week = 0; week < 6; week += 1) {
    const days: Array<{ date: Date; inMonth: boolean }> = [];
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + week * 7 + day);
      days.push({
        date,
        inMonth: date.getMonth() === month.getMonth(),
      });
    }
    weeks.push(days);
    const lastDay = days[6].date;
    if (lastDay.getMonth() !== month.getMonth() && lastDay.getDate() > 7) {
      break;
    }
  }

  return weeks;
}
