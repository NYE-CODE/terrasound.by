const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });

export function formatReviewDate(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "недавно";
  }

  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) {
    return rtf.format(diffDays, "day");
  }

  if (Math.abs(diffDays) < 30) {
    const weeks = Math.round(diffDays / 7);
    return rtf.format(weeks, "week");
  }

  if (Math.abs(diffDays) < 365) {
    const months = Math.round(diffDays / 30);
    return rtf.format(months, "month");
  }

  const years = Math.round(diffDays / 365);
  return rtf.format(years, "year");
}
