export function formatMonthYear(date: string | null): string {
  if (!date) return "";
  const [year, month] = date.split("-");
  return `${month}/${year}`;
}

export function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean,
): string {
  const start = formatMonthYear(startDate);
  if (isCurrent) return `${start} - Hiện tại`;
  const end = formatMonthYear(endDate);
  return end ? `${start} - ${end}` : start;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
