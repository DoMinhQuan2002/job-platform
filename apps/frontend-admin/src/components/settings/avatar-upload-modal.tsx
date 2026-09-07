"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LoaderCircle, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export type AvatarUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => Promise<void> | void;
};

const validateFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Chỉ hỗ trợ định dạng JPG hoặc PNG.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Dung lượng ảnh không được vượt quá 2MB.";
  }
  return null;
};

export function AvatarUploadModal({ open, onOpenChange, onConfirm }: AvatarUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      setDragActive(false);
    }
  }, [open]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const validationError = validateFile(candidate);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(candidate);
  };

  const handleConfirm = async () => {
    if (!file) return;
    setSubmitting(true);
    try {
      await onConfirm(file);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[1px] transition-opacity duration-150 data-closed:opacity-0 data-open:opacity-100" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.24)] outline-none transition duration-150 data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100">
          <div className="flex items-start justify-between">
            <div>
              <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
                Đổi avatar
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-slate-500">
                Chọn ảnh đại diện mới cho tài khoản của bạn.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Đóng hộp thoại"
              disabled={submitting}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "mt-6 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/60",
            )}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Xem trước avatar"
                className="size-24 rounded-full border-4 border-white object-cover shadow-sm"
              />
            ) : (
              <UploadCloud className="size-10 text-primary" strokeWidth={1.5} />
            )}

            <p className="text-sm font-semibold text-slate-700">
              {file ? file.name : "Kéo thả ảnh vào đây"}
            </p>
            {!file && <p className="text-xs text-slate-400">hoặc</p>}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-10 px-5"
            >
              Chọn ảnh từ máy tính
            </Button>

            <p className="text-xs text-slate-400">Dung lượng tối đa 2MB. Hỗ trợ định dạng: JPG, PNG.</p>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <DialogPrimitive.Close
              disabled={submitting}
              render={
                <Button type="button" variant="outline" className="h-10 min-w-20 px-5" />
              }
            >
              Hủy
            </DialogPrimitive.Close>
            <Button
              type="button"
              className="h-10 min-w-24 px-5"
              disabled={!file || submitting}
              onClick={() => void handleConfirm()}
            >
              {submitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {submitting ? "Đang tải..." : "Cập nhật"}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
