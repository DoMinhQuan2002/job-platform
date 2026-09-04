"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { AlertCircle, CheckCircle2, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertTone = "error" | "warning" | "success" | "info";

const toneStyles: Record<AlertTone, { icon: typeof AlertCircle; media: string; confirm: string }> = {
  error: {
    icon: TriangleAlert,
    media: "bg-red-50 text-red-600",
    confirm: "bg-red-600 text-white hover:bg-red-700",
  },
  warning: {
    icon: AlertCircle,
    media: "bg-amber-50 text-amber-600",
    confirm: "bg-amber-500 text-white hover:bg-amber-600",
  },
  success: {
    icon: CheckCircle2,
    media: "bg-emerald-50 text-emerald-600",
    confirm: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  info: {
    icon: Info,
    media: "bg-blue-50 text-blue-600",
    confirm: "bg-blue-600 text-white hover:bg-blue-700",
  },
};

export type AppAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  tone?: AlertTone;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
};

export function AppAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  tone = "info",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  showCancel = true,
  onConfirm,
}: AppAlertDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const style = toneStyles[tone];
  const Icon = style.icon;

  const handleConfirm = async () => {
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[1px] transition-opacity duration-150 data-closed:opacity-0 data-open:opacity-100" />
        <AlertDialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.24)] outline-none transition duration-150 data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100">
          <header className="flex items-center gap-3 px-6 py-5">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", style.media)}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <AlertDialogPrimitive.Title className="min-w-0 flex-1 text-lg font-semibold leading-6 text-slate-900">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Close
              aria-label="Đóng hộp thoại"
              disabled={isConfirming}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="size-5" aria-hidden="true" />
            </AlertDialogPrimitive.Close>
          </header>

          <AlertDialogPrimitive.Description className="border-y border-slate-200 px-6 py-6 text-sm leading-6 text-slate-600">
            {description}
          </AlertDialogPrimitive.Description>

          <footer className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
            {showCancel ? (
              <AlertDialogPrimitive.Close
                disabled={isConfirming}
                render={<Button type="button" variant="outline" className="h-10 min-w-20 border-slate-300 bg-white px-5 text-slate-700 hover:bg-slate-50" />}
              >
                {cancelLabel}
              </AlertDialogPrimitive.Close>
            ) : null}
            <Button
              type="button"
              className={cn("h-10 min-w-24 px-5", style.confirm)}
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {isConfirming ? "Đang xử lý..." : confirmLabel}
            </Button>
          </footer>
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
