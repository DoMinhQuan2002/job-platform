"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, Loader2 } from "lucide-react";
import type { AdminJobListItem } from "@/services/admin-jobs.service";

/* ─── Shared Job Info Box ─────────────────────────────────────── */
function JobInfoSummaryBox({ job }: { job: AdminJobListItem }) {
  const code =
    job.code || `JD-2405-${String(job.id).padStart(3, "0")}`;

  return (
    <div className="mt-4 bg-[#f8fafc] rounded-lg p-3.5 border border-gray-100 text-xs space-y-1.5 leading-relaxed">
      <div className="flex">
        <span className="w-20 text-gray-800 font-medium shrink-0">Tiêu đề:</span>
        <span className="font-semibold text-gray-800">{job.title}</span>
      </div>
      <div className="flex">
        <span className="w-20 text-gray-800 font-medium shrink-0">Mã tin:</span>
        <span className="text-gray-700">{code}</span>
      </div>
      <div className="flex">
        <span className="w-20 text-gray-800 font-medium shrink-0">Công ty:</span>
        <span className="text-gray-700">{job.company?.name || "—"}</span>
      </div>
    </div>
  );
}

/* ─── 1. Approve Modal (Xác nhận duyệt tin tuyển dụng) ────────── */
export interface ApproveModalProps {
  job: AdminJobListItem | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (job: AdminJobListItem) => void;
}

export function ApproveModal({
  job,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: ApproveModalProps) {
  // Close on ESC
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

  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-[650px] bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-gray-100"
        data-purpose="approve-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Đóng"
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-[#1b873f]">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex-1 pr-2 sm:pr-4">
            <h3 className="text-lg font-bold text-[#1b873f] tracking-tight">
              Xác nhận duyệt tin tuyển dụng
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Bạn có chắc chắn muốn duyệt tin tuyển dụng sau?
            </p>

            <JobInfoSummaryBox job={job} />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => onConfirm(job)}
                disabled={isLoading}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#1b873f] hover:bg-[#166e33] rounded-lg focus:outline-none transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác nhận duyệt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 2. Reject Modal (Từ chối tin tuyển dụng) ────────────────── */
export interface RejectModalProps {
  job: AdminJobListItem | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (job: AdminJobListItem, reason: string) => void;
}

export function RejectModal({
  job,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset reason when modal opens with new job
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
    }
  }, [isOpen, job?.id]);

  // Close on ESC
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

  if (!isOpen || !job) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setError("Lý do từ chối phải có tối thiểu 10 ký tự.");
      return;
    }
    if (trimmed.length > 500) {
      setError("Lý do từ chối không được vượt quá 500 ký tự.");
      return;
    }
    setError(null);
    onConfirm(job, trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-[650px] bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-gray-100"
        data-purpose="reject-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Đóng"
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <X className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex-1 pr-2 sm:pr-4">
            <h3 className="text-lg font-bold text-red-600 tracking-tight">
              Từ chối tin tuyển dụng
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Bạn có chắc chắn muốn từ chối tin tuyển dụng này?
            </p>

            <div className="mt-4">
              <label
                htmlFor="reject-reason"
                className="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="reject-reason"
                  rows={3}
                  maxLength={500}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập lý do từ chối (từ 10 đến 500 ký tự)..."
                  className="w-full text-xs sm:text-sm text-gray-700 rounded-lg border border-gray-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder-gray-400 p-2.5 pb-6 resize-none outline-none transition-colors"
                />
                <span className="absolute bottom-2 right-2.5 text-[11px] text-gray-400 select-none">
                  {reason.length}/500
                </span>
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <div className="mt-3">
              <JobInfoSummaryBox job={job} />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading || reason.trim().length < 10}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#cc2929] hover:bg-red-700 rounded-lg focus:outline-none transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác nhận từ chối</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. Delete Modal (Xác nhận xóa tin tuyển dụng) ───────────── */
export interface DeleteModalProps {
  job: AdminJobListItem | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (job: AdminJobListItem) => void;
}

export function DeleteModal({
  job,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  // Close on ESC
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

  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-[650px] bg-white rounded-2xl shadow-2xl p-6 sm:p-7 border border-gray-100"
        data-purpose="delete-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Đóng"
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Trash2 className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex-1 pr-2 sm:pr-4">
            <h3 className="text-lg font-bold text-red-600 tracking-tight">
              Xác nhận xóa tin tuyển dụng
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Bạn có chắc chắn muốn xóa tin tuyển dụng này không? Hành động này sẽ xóa mềm tin khỏi danh sách hiển thị.
            </p>

            <JobInfoSummaryBox job={job} />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => onConfirm(job)}
                disabled={isLoading}
                className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
