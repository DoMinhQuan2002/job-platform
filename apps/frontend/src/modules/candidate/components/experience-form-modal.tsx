"use client";

import { useEffect, useState } from "react";
import { toDateInputValue, todayDateInputValue } from "../lib/format";
import type { WorkExperience, WorkExperienceFormInput } from "../types";
import {
  FormFieldError,
  FormLabel,
  ProfileFormModal,
  fieldClassName,
  formInputClassName,
  formTextareaClassName,
} from "./profile-form-modal";

const emptyForm: WorkExperienceFormInput = {
  companyName: "",
  position: "",
  startDate: "",
  endDate: null,
  isCurrent: false,
  description: "",
};

const DESCRIPTION_MAX = 500;

type ExperienceErrors = {
  companyName?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
};

type ExperienceFormModalProps = {
  open: boolean;
  saving: boolean;
  editingItem: WorkExperience | null;
  onClose: () => void;
  onCreate: (input: WorkExperienceFormInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<WorkExperienceFormInput>) => Promise<void>;
};

export function ExperienceFormModal({
  open,
  saving,
  editingItem,
  onClose,
  onCreate,
  onUpdate,
}: ExperienceFormModalProps) {
  const [form, setForm] = useState<WorkExperienceFormInput>(emptyForm);
  const [errors, setErrors] = useState<ExperienceErrors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (editingItem) {
      setForm({
        companyName: editingItem.companyName,
        position: editingItem.position,
        startDate: toDateInputValue(editingItem.startDate),
        endDate: toDateInputValue(editingItem.endDate) || null,
        isCurrent: editingItem.isCurrent,
        description: editingItem.description ?? "",
      });
      return;
    }

    setForm(emptyForm);
  }, [open, editingItem]);

  const today = todayDateInputValue();

  const validateDates = (
    startDate: string,
    endDate: string | null | undefined,
    isCurrent: boolean | undefined,
  ): Pick<ExperienceErrors, "startDate" | "endDate"> => {
    const next: Pick<ExperienceErrors, "startDate" | "endDate"> = {};

    if (startDate && startDate > today) {
      next.startDate = "Ngày bắt đầu không được ở tương lai";
    }
    if (!isCurrent && endDate && startDate && endDate < startDate) {
      next.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    } else if (!isCurrent && endDate && endDate > today) {
      next.endDate = "Ngày kết thúc không được ở tương lai";
    }

    return next;
  };

  const validate = (): ExperienceErrors => {
    const next: ExperienceErrors = {
      ...validateDates(form.startDate, form.endDate, form.isCurrent),
    };

    if (!form.companyName.trim()) next.companyName = "Vui lòng nhập tên công ty";
    if (!form.position.trim()) next.position = "Vui lòng nhập vị trí";
    if (!form.startDate) next.startDate = "Vui lòng chọn ngày bắt đầu";

    return next;
  };

  const handleStartDateChange = (startDate: string) => {
    setForm({ ...form, startDate });
    const dateErrors = validateDates(startDate, form.endDate, form.isCurrent);
    setErrors({
      ...errors,
      startDate: dateErrors.startDate,
      endDate: dateErrors.endDate,
    });
  };

  const handleEndDateChange = (endDate: string | null) => {
    setForm({ ...form, endDate });
    setErrors({
      ...errors,
      endDate: validateDates(form.startDate, endDate, form.isCurrent).endDate,
    });
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: WorkExperienceFormInput = {
      ...form,
      companyName: form.companyName.trim(),
      position: form.position.trim(),
      endDate: form.isCurrent ? null : form.endDate || null,
      description: form.description?.trim().slice(0, DESCRIPTION_MAX) || null,
    };

    if (editingItem) {
      await onUpdate(editingItem.id, payload);
    } else {
      await onCreate(payload);
    }
    onClose();
  };

  const descriptionLength = (form.description ?? "").length;

  return (
    <ProfileFormModal
      open={open}
      title={editingItem ? "Sửa kinh nghiệm" : "Thêm kinh nghiệm"}
      saving={saving}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
    >
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <FormLabel required htmlFor="exp-company">
              Tên công ty
            </FormLabel>
            <input
              id="exp-company"
              value={form.companyName}
              aria-invalid={Boolean(errors.companyName)}
              onChange={(event) => {
                setForm({ ...form, companyName: event.target.value });
                if (errors.companyName) setErrors({ ...errors, companyName: undefined });
              }}
              placeholder="Nhập tên công ty"
              className={fieldClassName(formInputClassName, Boolean(errors.companyName))}
            />
            <FormFieldError message={errors.companyName} />
          </div>
          <div className="space-y-1">
            <FormLabel required htmlFor="exp-position">
              Vị trí
            </FormLabel>
            <input
              id="exp-position"
              value={form.position}
              aria-invalid={Boolean(errors.position)}
              onChange={(event) => {
                setForm({ ...form, position: event.target.value });
                if (errors.position) setErrors({ ...errors, position: undefined });
              }}
              placeholder="Nhập vị trí công việc"
              className={fieldClassName(formInputClassName, Boolean(errors.position))}
            />
            <FormFieldError message={errors.position} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <FormLabel required htmlFor="exp-start">
              Ngày bắt đầu
            </FormLabel>
            <input
              id="exp-start"
              type="date"
              max={today}
              value={form.startDate}
              aria-invalid={Boolean(errors.startDate)}
              onChange={(event) => handleStartDateChange(event.target.value)}
              onBlur={() => {
                if (!form.startDate) {
                  setErrors({ ...errors, startDate: "Vui lòng chọn ngày bắt đầu" });
                }
              }}
              className={fieldClassName(formInputClassName, Boolean(errors.startDate))}
            />
            <FormFieldError message={errors.startDate} />
          </div>
          <div className="space-y-1">
            <FormLabel htmlFor="exp-end">Ngày kết thúc</FormLabel>
            <input
              id="exp-end"
              type="date"
              disabled={form.isCurrent}
              min={form.startDate || undefined}
              max={today}
              value={form.endDate ?? ""}
              aria-invalid={Boolean(errors.endDate)}
              onChange={(event) =>
                handleEndDateChange(event.target.value || null)
              }
              className={fieldClassName(formInputClassName, Boolean(errors.endDate))}
            />
            <FormFieldError message={errors.endDate} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isCurrent ?? false}
            onChange={(event) => {
              setForm({ ...form, isCurrent: event.target.checked, endDate: null });
              setErrors({ ...errors, endDate: undefined });
            }}
          />
          Đang làm việc tại đây
        </label>

        <div className="space-y-1">
          <FormLabel htmlFor="exp-description">Mô tả công việc</FormLabel>
          <div className="relative">
            <textarea
              id="exp-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value.slice(0, DESCRIPTION_MAX),
                })
              }
              rows={4}
              placeholder="Mô tả trách nhiệm, thành tích..."
              className={formTextareaClassName}
            />
            <span className="absolute bottom-2 right-3 text-xs text-muted">
              {descriptionLength}/{DESCRIPTION_MAX}
            </span>
          </div>
        </div>
      </div>
    </ProfileFormModal>
  );
}
