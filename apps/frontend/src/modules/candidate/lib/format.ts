/** Giá trị `YYYY-MM-DD` cho `<input type="date">` theo ngày local hôm nay. */
export function todayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Chuẩn hóa ISO/`YYYY-MM-DD` về `YYYY-MM-DD` cho date input. */
export function toDateInputValue(date: string | null | undefined): string {
  if (!date) return "";
  return date.slice(0, 10);
}

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
