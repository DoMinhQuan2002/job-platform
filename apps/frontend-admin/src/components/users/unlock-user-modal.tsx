"use client";

import { useEffect } from "react";
import { Info, RefreshCw, Unlock, X } from "lucide-react";

interface UnlockUserModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean | void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function UnlockUserModal({
  isOpen,
  userName,
  onClose,
  onConfirm,
  isLoading = false,
  errorMessage = null,
}: UnlockUserModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#191C1E]">
            Xác nhận mở khóa tài khoản
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

        {/* Modal Body */}
        <div className="px-6 py-8 text-center">
          <div className="size-16 rounded-full bg-[#FFEDD5] text-[#9A3412] flex items-center justify-center mx-auto mb-5 ring-8 ring-[#FFEDD5]/40">
            <Info className="size-8 text-[#9A3412]" />
          </div>

          <h4 className="text-base font-bold text-[#191C1E] mb-2 px-2 leading-snug">
            Bạn có chắc chắn muốn mở khóa tài khoản của {userName}?
          </h4>

          <p className="text-sm text-[#525463] max-w-xs mx-auto leading-relaxed">
            Sau khi mở khóa, người dùng có thể đăng nhập và sử dụng hệ thống như bình thường.
          </p>

          {errorMessage && (
            <p className="text-xs text-red-600 mt-4 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F7F9FB] px-6 py-4 flex items-center gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-[#444653] font-medium text-sm py-2.5 rounded-lg text-center transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isLoading}
            className="flex-1 bg-[#00288E] hover:bg-[#00288E]/90 active:bg-[#001D6E] text-white font-medium text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isLoading ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Unlock className="size-4" />
                Xác nhận mở khóa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
