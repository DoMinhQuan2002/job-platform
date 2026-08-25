"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfileFormModalProps = {
  open: boolean;
  title: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
  className?: string;
};

export function ProfileFormModal({
  open,
  title,
  saving,
  onClose,
  onSubmit,
  children,
  className,
}: ProfileFormModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-[1px]" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-form-modal-title"
        className={cn(
          "relative flex max-h-[92vh] w-full max-w-[672px] flex-col overflow-hidden rounded-xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e1e3eb] px-6 py-5">
          <h2 id="profile-form-modal-title" className="text-xl font-semibold text-[#191a20]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-muted/40 hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">{children}</div>

        <div className="flex justify-end gap-3 border-t border-[#e1e3eb] px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="button" onClick={onSubmit} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FormLabel({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#191a20]">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
    </label>
  );
}

export const formInputClassName =
  "w-full rounded-lg border border-[#c3c6d2] px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-[#6b7280] focus:border-primary";

export const formSelectClassName = formInputClassName;

export const formTextareaClassName =
  "w-full resize-none rounded-lg border border-[#c3c6d2] px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-[#6b7280] focus:border-primary";

export const formInputErrorClassName =
  "border-destructive focus:border-destructive aria-invalid:border-destructive";

export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function fieldClassName(base: string, hasError?: boolean) {
  return cn(base, hasError && formInputErrorClassName);
}
