"use client";

import { todayDateInputValue } from "../lib/format";
import { validateDateRange, type DateRangeErrors } from "../lib/date-range";
import {
  FormFieldError,
  FormLabel,
  fieldClassName,
  formInputClassName,
} from "./profile-form-modal";

type DateRangeFieldsProps = {
  idPrefix: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  currentLabel: string;
  errors: DateRangeErrors;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string | null) => void;
  onIsCurrentChange: (isCurrent: boolean) => void;
  onErrorsChange: (errors: DateRangeErrors) => void;
};

export function DateRangeFields({
  idPrefix,
  startDate,
  endDate,
  isCurrent,
  currentLabel,
  errors,
  onStartDateChange,
  onEndDateChange,
  onIsCurrentChange,
  onErrorsChange,
}: DateRangeFieldsProps) {
  const today = todayDateInputValue();
  const startId = `${idPrefix}-start`;
  const endId = `${idPrefix}-end`;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1">
          <FormLabel required htmlFor={startId}>
            Ngày bắt đầu
          </FormLabel>
          <input
            id={startId}
            type="date"
            max={today}
            value={startDate}
            aria-invalid={Boolean(errors.startDate)}
            onChange={(event) => {
              const nextStart = event.target.value;
              onStartDateChange(nextStart);
              onErrorsChange(validateDateRange(nextStart, endDate, isCurrent));
            }}
            onBlur={() => {
              if (!startDate) {
                onErrorsChange({
                  ...errors,
                  startDate: "Vui lòng chọn ngày bắt đầu",
                });
              }
            }}
            className={fieldClassName(formInputClassName, Boolean(errors.startDate))}
          />
          <FormFieldError message={errors.startDate} />
        </div>
        <div className="space-y-1">
          <FormLabel htmlFor={endId}>Ngày kết thúc</FormLabel>
          <input
            id={endId}
            type="date"
            disabled={isCurrent}
            min={startDate || undefined}
            max={today}
            value={endDate ?? ""}
            aria-invalid={Boolean(errors.endDate)}
            onChange={(event) => {
              const nextEnd = event.target.value || null;
              onEndDateChange(nextEnd);
              onErrorsChange({
                ...errors,
                endDate: validateDateRange(startDate, nextEnd, isCurrent).endDate,
              });
            }}
            className={fieldClassName(formInputClassName, Boolean(errors.endDate))}
          />
          <FormFieldError message={errors.endDate} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(event) => {
            onIsCurrentChange(event.target.checked);
            onErrorsChange({ ...errors, endDate: undefined });
          }}
        />
        {currentLabel}
      </label>
    </div>
  );
}
