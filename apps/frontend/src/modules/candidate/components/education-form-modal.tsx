"use client";

import { useEffect, useState } from "react";
import type { Education, EducationFormInput } from "../types";
import {
  FormFieldError,
  FormLabel,
  ProfileFormModal,
  fieldClassName,
  formInputClassName,
  formSelectClassName,
  formTextareaClassName,
} from "./profile-form-modal";

const DEGREE_OPTIONS = [
  { value: "", label: "Chọn bằng cấp" },
  { value: "Trung cấp", label: "Trung cấp" },
  { value: "Cao đẳng", label: "Cao đẳng" },
  { value: "Cử nhân", label: "Cử nhân" },
  { value: "Kỹ sư", label: "Kỹ sư" },
  { value: "Thạc sĩ", label: "Thạc sĩ" },
  { value: "Tiến sĩ", label: "Tiến sĩ" },
  { value: "Khác", label: "Khác" },
];

const emptyForm: EducationFormInput = {
  school: "",
  major: "",
  degree: "",
  startDate: "",
  endDate: null,
  isCurrent: false,
  description: "",
};

const DESCRIPTION_MAX = 500;

type EducationErrors = {
  school?: string;
  startDate?: string;
  endDate?: string;
};

type EducationFormModalProps = {
  open: boolean;
  saving: boolean;
  editingItem: Education | null;
  onClose: () => void;
  onCreate: (input: EducationFormInput) => Promise<void>;
  onUpdate: (id: string, input: Partial<EducationFormInput>) => Promise<void>;
};

export function EducationFormModal({
  open,
  saving,
  editingItem,
  onClose,
  onCreate,
  onUpdate,
}: EducationFormModalProps) {
  const [form, setForm] = useState<EducationFormInput>(emptyForm);
  const [errors, setErrors] = useState<EducationErrors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (editingItem) {
      setForm({
        school: editingItem.school,
        major: editingItem.major ?? "",
        degree: editingItem.degree ?? "",
        startDate: editingItem.startDate ?? "",
        endDate: editingItem.endDate,
        isCurrent: editingItem.isCurrent,
        description: editingItem.description ?? "",
      });
      return;
    }

    setForm(emptyForm);
  }, [open, editingItem]);

  const validate = (): EducationErrors => {
    const next: EducationErrors = {};

    if (!form.school.trim()) next.school = "Vui lòng nhập tên trường";
    if (!form.startDate) next.startDate = "Vui lòng chọn ngày bắt đầu";
    if (
      !form.isCurrent &&
      form.endDate &&
      form.startDate &&
      form.endDate < form.startDate
    ) {
      next.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    return next;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: EducationFormInput = {
      ...form,
      school: form.school.trim(),
      major: form.major?.trim() || null,
      degree: form.degree?.trim() || null,
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
      title={editingItem ? "Sửa học vấn" : "Thêm học vấn"}
      saving={saving}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
    >
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <FormLabel required htmlFor="edu-school">
              Tên trường
            </FormLabel>
            <input
              id="edu-school"
              value={form.school}
              aria-invalid={Boolean(errors.school)}
              onChange={(event) => {
                setForm({ ...form, school: event.target.value });
                if (errors.school) setErrors({ ...errors, school: undefined });
              }}
              placeholder="Nhập tên trường"
              className={fieldClassName(formInputClassName, Boolean(errors.school))}
            />
            <FormFieldError message={errors.school} />
          </div>
          <div className="space-y-1">
            <FormLabel htmlFor="edu-major">Chuyên ngành</FormLabel>
            <input
              id="edu-major"
              value={form.major ?? ""}
              onChange={(event) => setForm({ ...form, major: event.target.value })}
              placeholder="Nhập chuyên ngành"
              className={formInputClassName}
            />
          </div>
        </div>

        <div className="space-y-1">
          <FormLabel htmlFor="edu-degree">Bằng cấp</FormLabel>
          <select
            id="edu-degree"
            value={form.degree ?? ""}
            onChange={(event) => setForm({ ...form, degree: event.target.value })}
            className={formSelectClassName}
          >
            {DEGREE_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <FormLabel required htmlFor="edu-start">
              Ngày bắt đầu
            </FormLabel>
            <input
              id="edu-start"
              type="date"
              value={form.startDate}
              aria-invalid={Boolean(errors.startDate)}
              onChange={(event) => {
                setForm({ ...form, startDate: event.target.value });
                if (errors.startDate) setErrors({ ...errors, startDate: undefined });
              }}
              className={fieldClassName(formInputClassName, Boolean(errors.startDate))}
            />
            <FormFieldError message={errors.startDate} />
          </div>
          <div className="space-y-1">
            <FormLabel htmlFor="edu-end">Ngày kết thúc</FormLabel>
            <input
              id="edu-end"
              type="date"
              disabled={form.isCurrent}
              value={form.endDate ?? ""}
              aria-invalid={Boolean(errors.endDate)}
              onChange={(event) => {
                setForm({ ...form, endDate: event.target.value || null });
                if (errors.endDate) setErrors({ ...errors, endDate: undefined });
              }}
              className={fieldClassName(formInputClassName, Boolean(errors.endDate))}
            />
            <FormFieldError message={errors.endDate} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isCurrent ?? false}
            onChange={(event) =>
              setForm({ ...form, isCurrent: event.target.checked, endDate: null })
            }
          />
          Đang học
        </label>

        <div className="space-y-1">
          <FormLabel htmlFor="edu-description">Mô tả thêm</FormLabel>
          <div className="relative">
            <textarea
              id="edu-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value.slice(0, DESCRIPTION_MAX),
                })
              }
              rows={4}
              placeholder="Nhập mô tả thêm (nếu có)"
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
