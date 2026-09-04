import { todayDateInputValue } from "./format";

export type DateRangeErrors = {
  startDate?: string;
  endDate?: string;
};

export type DateRangeValue = {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
};

/** Validate start/end theo rule hồ sơ: không tương lai, end >= start. */
export function validateDateRange(
  startDate: string,
  endDate: string | null | undefined,
  isCurrent: boolean | undefined,
  options?: { requireStart?: boolean; today?: string },
): DateRangeErrors {
  const today = options?.today ?? todayDateInputValue();
  const next: DateRangeErrors = {};

  if (options?.requireStart && !startDate) {
    next.startDate = "Vui lòng chọn ngày bắt đầu";
  } else if (startDate && startDate > today) {
    next.startDate = "Ngày bắt đầu không được ở tương lai";
  }

  if (!isCurrent && endDate && startDate && endDate < startDate) {
    next.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
  } else if (!isCurrent && endDate && endDate > today) {
    next.endDate = "Ngày kết thúc không được ở tương lai";
  }

  return next;
}
