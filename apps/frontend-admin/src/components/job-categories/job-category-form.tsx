"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  adminJobCategoriesApi,
  type JobCategoryItem,
  type JobCategoryStatus,
} from "@/services/admin-job-categories.service";
import {
  UpdateCategoryModal,
  CategoryToastContainer,
  type CategoryToastNotification,
} from "./job-category-modals";

export const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface JobCategoryFormProps {
  initialData?: JobCategoryItem | null;
  mode: "create" | "edit";
}

export function JobCategoryForm({ initialData, mode }: JobCategoryFormProps) {
  const router = useRouter();

  const isEdit = mode === "edit";
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState<JobCategoryStatus>(initialData?.status ?? "ACTIVE");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; general?: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [toasts, setToasts] = useState<CategoryToastNotification[]>([]);

  const addToast = (type: "success" | "error", title: string, message: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Tính slug tự động từ tên ngành nghề
  const currentSlug = isEdit && initialData?.slug && name === initialData.name
    ? initialData.slug
    : slugify(name);

  const validate = (): boolean => {
    const errors: { name?: string } = {};
    const trimmed = name.trim();
    if (!trimmed) {
      errors.name = "Tên ngành nghề không được để trống";
    } else if (trimmed.length < 2 || trimmed.length > 150) {
      errors.name = "Tên ngành nghề phải từ 2 đến 150 ký tự";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      // Mở modal xác nhận cập nhật
      setShowUpdateModal(true);
    } else {
      executeCreate();
    }
  };

  const executeCreate = async () => {
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await adminJobCategoriesApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      addToast("success", "Thêm ngành nghề thành công!", "Ngành nghề mới đã được thêm vào hệ thống.");

      setTimeout(() => {
        router.push("/admin/job-categories");
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Thêm ngành nghề thất bại.";
      setFieldErrors({ general: errorMsg });
      addToast("error", "Thêm ngành nghề thất bại!", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeUpdate = async () => {
    if (!initialData) return;
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await adminJobCategoriesApi.update(initialData.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      });

      setShowUpdateModal(false);
      addToast(
        "success",
        "Cập nhật ngành nghề thành công!",
        "Thông tin ngành nghề đã được cập nhật."
      );

      setTimeout(() => {
        router.push("/admin/job-categories");
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Cập nhật ngành nghề thất bại.";
      setFieldErrors({ general: errorMsg });
      setShowUpdateModal(false);
      addToast("error", "Cập nhật ngành nghề thất bại!", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl w-full">
      {/* Toast notifications */}
      <CategoryToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Back Button */}
      <div>
        <Link
          href="/admin/job-categories"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isEdit ? "Sửa ngành nghề" : "Thêm ngành nghề"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isEdit
            ? "Cập nhật thông tin ngành nghề trong hệ thống"
            : "Tạo mới ngành nghề trong hệ thống"}
        </p>

        {/* Breadcrumb text */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-2">
          <Link href="/admin" className="hover:text-slate-600 transition-colors">
            Dashboard
          </Link>
          <span>&gt;</span>
          <Link href="/admin/job-categories" className="hover:text-slate-600 transition-colors">
            Quản lý ngành nghề
          </Link>
          <span>&gt;</span>
          <span className="text-slate-800 font-semibold">
            {isEdit ? "Sửa ngành nghề" : "Thêm ngành nghề"}
          </span>
        </nav>
      </div>

      {/* Form Card */}
      <section
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs"
        data-purpose="category-form-card"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-base font-bold text-slate-900 mb-6">Thông tin ngành nghề</h2>

          {/* General error banner if any */}
          {fieldErrors.general && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {fieldErrors.general}
            </div>
          )}

          {/* Trường 1: Tên ngành nghề */}
          <div>
            <label
              htmlFor="category-name"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              Tên ngành nghề <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              id="category-name"
              name="category-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Nhập tên ngành nghề"
              className={`w-full rounded-lg border ${
                fieldErrors.name ? "border-red-400 focus:border-red-500 focus:ring-red-400" : "border-slate-300 focus:border-blue-600 focus:ring-blue-600"
              } text-sm text-slate-900 px-4 py-2.5 focus:outline-none focus:ring-1 transition-colors placeholder-slate-400`}
            />
            {fieldErrors.name ? (
              <p className="text-xs text-red-500 font-medium mt-1.5">{fieldErrors.name}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-2">
                Tên ngành nghề không được để trống và không được trùng.
              </p>
            )}
          </div>

          {/* Trường 2: Slug (tự động) */}
          <div>
            <label
              htmlFor="category-slug"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              Slug (tự động) {isEdit && <span className="text-red-500 font-bold">*</span>}
            </label>
            <input
              id="category-slug"
              name="category-slug"
              type="text"
              value={currentSlug}
              readOnly
              disabled
              placeholder="Hệ thống sẽ tự động tạo slug từ tên ngành nghề"
              className="w-full rounded-lg border border-slate-200 bg-slate-100/90 text-sm text-slate-600 px-4 py-2.5 cursor-not-allowed select-none focus:outline-none placeholder-slate-400"
            />
            <p className="text-xs text-slate-500 mt-2">
              Slug được tạo tự động từ tên ngành nghề, không thể chỉnh sửa.
            </p>
          </div>

          {/* Trường 3: Trạng thái */}
          <div>
            <label
              htmlFor="category-status"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              Trạng thái <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                id="category-status"
                name="category-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobCategoryStatus)}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-900 pl-8 pr-10 py-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors cursor-pointer"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>

              {/* Status Dot indicator */}
              <span
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                  status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Chọn trạng thái hiển thị của ngành nghề.</p>
          </div>

          {/* Lưu ý Box */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 sm:p-4.5 flex gap-3 text-slate-700">
            <div className="shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center text-blue-600 text-xs font-semibold italic">
                i
              </div>
            </div>
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-bold text-blue-700 block text-[13px] mb-1">Lưu ý</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-0.5">
                <li>Tên ngành nghề là bắt buộc.</li>
                <li>Slug được hệ thống tự động tạo và không thể chỉnh sửa.</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/admin/job-categories")}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEdit ? "Cập nhật" : "Thêm mới"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Update confirmation modal */}
      {isEdit && (
        <UpdateCategoryModal
          categoryName={name}
          isOpen={showUpdateModal}
          isLoading={isSubmitting}
          onClose={() => setShowUpdateModal(false)}
          onConfirm={executeUpdate}
        />
      )}
    </div>
  );
}
