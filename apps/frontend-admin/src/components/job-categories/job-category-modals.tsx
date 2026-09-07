"use client";

import React, { useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import type { JobCategoryItem } from "@/services/admin-job-categories.service";

/* ─── 1. Modal Xác nhận xóa ngành nghề ────────────────────────── */
export interface DeleteCategoryModalProps {
  category: JobCategoryItem | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (category: JobCategoryItem) => void;
}

export function DeleteCategoryModal({
  category,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) {
  // Đóng khi bấm phím ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <article
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-7 sm:p-8 relative flex flex-col items-center"
        data-purpose="delete-confirmation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          aria-label="Đóng"
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Warning Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-[#fff4eb] border-2 border-[#f97316] flex items-center justify-center mb-5 text-[#f97316] select-none">
          <span className="text-3xl font-bold font-sans">!</span>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-[21px] font-bold text-slate-900 mb-3 text-center">
          Xác nhận xóa ngành nghề
        </h2>

        {/* Nội dung */}
        <div className="text-center text-[15px] text-slate-600 leading-relaxed mb-8">
          <p>
            Bạn có chắc chắn muốn xóa ngành nghề{" "}
            <span className="text-[#dc2626] font-medium">“{category.name}”</span>?
          </p>
          <p className="text-slate-400 text-[14px] mt-1.5">Hành động này không thể hoàn tác.</p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-[124px] py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-[15px] font-medium rounded-lg border border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(category)}
            disabled={isLoading}
            className="w-[124px] py-2.5 px-4 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[15px] font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Xóa</span>
          </button>
        </div>
      </article>
    </div>
  );
}

/* ─── 2. Modal Xác nhận cập nhật ngành nghề ───────────────────── */
export interface UpdateCategoryModalProps {
  categoryName: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UpdateCategoryModal({
  categoryName,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: UpdateCategoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <article
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-7 sm:p-8 relative flex flex-col items-center"
        data-purpose="update-confirmation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          aria-label="Đóng"
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Info Icon Circle */}
        <div className="w-16 h-16 rounded-full bg-[#eff6ff] border-2 border-[#3b82f6] flex items-center justify-center mb-5 text-[#2563eb] select-none">
          <span className="text-3xl font-serif font-bold italic">i</span>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-[21px] font-bold text-slate-900 mb-3 text-center">
          Xác nhận cập nhật ngành nghề
        </h2>

        {/* Nội dung */}
        <div className="text-center text-[15px] text-slate-600 leading-relaxed mb-8">
          <p>Bạn có chắc chắn muốn cập nhật thông tin</p>
          <p className="mt-0.5">
            ngành nghề <span className="text-[#1d4ed8] font-semibold">“{categoryName}”</span>?
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-[124px] py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-[15px] font-medium rounded-lg border border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-[124px] py-2.5 px-4 bg-[#0a56d9] hover:bg-[#0747b5] text-white text-[15px] font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Cập nhật</span>
          </button>
        </div>
      </article>
    </div>
  );
}

/* ─── 3. Toast Thông báo hoàn thành ──────────────────────────── */
export type CategoryToastNotification = {
  id: string;
  type?: "success" | "error";
  title: string;
  message: string;
};

export interface CategoryToastProps {
  toasts: CategoryToastNotification[];
  onDismiss: (id: string) => void;
}

export function CategoryToastContainer({ toasts, onDismiss }: CategoryToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        return (
          <aside
            key={toast.id}
            className={`pointer-events-auto w-full max-w-[460px] bg-white rounded-xl shadow-xl border border-slate-100 ${
              isError
                ? "border-l-[4.5px] border-l-[#dc2626]"
                : "border-l-[4.5px] border-l-[#16a34a]"
            } p-4 sm:py-5 sm:px-6 flex items-center justify-between relative overflow-hidden animate-toastIn`}
            data-purpose="category-toast-notification"
          >
            <div className="flex items-center gap-4">
              {/* Success / Error Check Icon */}
              <div
                className={`shrink-0 w-10 h-10 rounded-full ${
                  isError ? "bg-[#dc2626]" : "bg-[#16a34a]"
                } flex items-center justify-center text-white shadow-sm`}
              >
                {isError ? (
                  <X className="w-6 h-6 stroke-[2.8]" />
                ) : (
                  <Check className="w-6 h-6 stroke-[2.8]" />
                )}
              </div>

              {/* Toast Content */}
              <div>
                <h3
                  className={`text-[17px] font-bold ${
                    isError ? "text-[#b91c1c]" : "text-[#15803d]"
                  } tracking-tight`}
                >
                  {toast.title}
                </h3>
                <p className="text-[14px] text-slate-600 mt-0.5">{toast.message}</p>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              aria-label="Đóng thông báo"
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1.5 ml-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </aside>
        );
      })}
    </div>
  );
}
