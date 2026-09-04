"use client";

import { useEffect, useState } from "react";
import { validateDateRange, type DateRangeErrors } from "../lib/date-range";
import { toDateInputValue } from "../lib/format";
import type { WorkExperience, WorkExperienceFormInput } from "../types";
import { DateRangeFields } from "./date-range-fields";
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
} & DateRangeErrors;

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

  const validate = (): ExperienceErrors => {
    const next: ExperienceErrors = {
      ...validateDateRange(form.startDate, form.endDate, form.isCurrent, {
        requireStart: true,
      }),
    };
    if (!form.companyName.trim()) next.companyName = "Vui lòng nhập tên công ty";
    if (!form.position.trim()) next.position = "Vui lòng nhập vị trí";
    return next;
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

        <DateRangeFields
          idPrefix="exp"
          startDate={form.startDate}
          endDate={form.endDate ?? null}
          isCurrent={form.isCurrent ?? false}
          currentLabel="Đang làm việc tại đây"
          errors={{ startDate: errors.startDate, endDate: errors.endDate }}
          onStartDateChange={(startDate) => setForm({ ...form, startDate })}
          onEndDateChange={(endDate) => setForm({ ...form, endDate })}
          onIsCurrentChange={(isCurrent) =>
            setForm({ ...form, isCurrent, endDate: null })
          }
          onErrorsChange={(dateErrors) =>
            setErrors({
              ...errors,
              startDate: dateErrors.startDate,
              endDate: dateErrors.endDate,
            })
          }
        />

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
