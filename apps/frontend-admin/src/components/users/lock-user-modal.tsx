"use client";

import { useEffect, useState } from "react";
import { Lock, RefreshCw, X } from "lucide-react";

interface LockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean | void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

function LockUserModalDialog({
  onClose,
  onConfirm,
  isLoading = false,
  errorMessage = null,
}: Omit<LockUserModalProps, "isOpen">) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      setValidationError("Lý do khóa tài khoản phải từ 10 đến 500 ký tự.");
      return;
    }
    if (trimmed.length > 500) {
      setValidationError("Lý do khóa tài khoản không được vượt quá 500 ký tự.");
      return;
    }

    setValidationError(null);
    await onConfirm(trimmed);
  };

  const activeError = validationError || errorMessage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#191C1E]">
            Khóa tài khoản người dùng
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#444653] leading-relaxed">
              Bạn có chắc chắn muốn khóa tài khoản của người dùng này? Người dùng sẽ không thể đăng nhập và sử dụng hệ thống.
            </p>

            <div>
              <label
                htmlFor="lock-reason-input"
                className="block text-sm font-medium text-[#191C1E] mb-1.5"
              >
                Lý do khóa tài khoản <span className="text-red-600">*</span>
              </label>
              <textarea
                id="lock-reason-input"
                rows={4}
                maxLength={500}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isLoading}
                placeholder="Nhập lý do khóa tài khoản (từ 10 đến 500 ký tự)..."
                className="border border-[#C4C5D5] rounded-xl p-3.5 text-sm text-[#191C1E] placeholder:text-slate-400 focus:outline-none focus:border-[#00288E] focus:ring-1 focus:ring-[#00288E] w-full resize-none transition-colors"
                autoFocus
              />
              <div className="flex items-center justify-between mt-1">
                {activeError ? (
                  <p className="text-xs text-red-600">{activeError}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-slate-400 ml-auto">
                  {reason.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-[#F7F9FB] px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-sm font-medium text-[#444653] hover:text-[#191C1E] px-4 py-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#B91C1C] hover:bg-[#991B1B] active:bg-[#7F1D1D] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Xác nhận khóa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LockUserModal(props: LockUserModalProps) {
  if (!props.isOpen) return null;
  return <LockUserModalDialog {...props} />;
}
