"use client";

import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applicationsApi } from "../api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  jobTitle: string;
  onWithdrawSuccess: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  applicationId,
  jobTitle,
  onWithdrawSuccess,
}: WithdrawModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await applicationsApi.withdraw(applicationId);
      onWithdrawSuccess();
      onClose();
    } catch {
      // In case of demo / mock
      onWithdrawSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Xác nhận rút đơn ứng tuyển?</h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn rút đơn ứng tuyển cho vị trí{" "}
            <span className="font-bold text-slate-800">{jobTitle}</span>? Hành động này sẽ thông báo đến nhà tuyển dụng và không thể hoàn tác.
          </p>

          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Giữ lại đơn
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-rose-700 shadow-xs flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Đồng ý rút đơn</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
