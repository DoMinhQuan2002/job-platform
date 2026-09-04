"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ResultTone = "success" | "error";

const dotColors: Record<ResultTone, string[]> = {
  success: ["bg-amber-400", "bg-violet-400", "bg-orange-400", "bg-sky-400", "bg-rose-400", "bg-emerald-400"],
  error: ["bg-red-400", "bg-rose-500", "bg-red-300", "bg-rose-300"],
};

const dotPositions = [
  "left-6 top-2 size-2",
  "right-8 top-0 size-2.5",
  "-left-1 top-16 size-1.5",
  "right-0 top-20 size-2",
  "left-8 bottom-0 size-1.5",
  "right-10 bottom-2 size-1.5",
];

export type ResultModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone: ResultTone;
  title: string;
  description: string;
  closeLabel?: string;
};

export function ResultModal({
  open,
  onOpenChange,
  tone,
  title,
  description,
  closeLabel = "Đóng",
}: ResultModalProps) {
  const colors = dotColors[tone];
  const Icon = tone === "success" ? Check : X;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[1px] transition-opacity duration-150 data-closed:opacity-0 data-open:opacity-100" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-100 bg-white px-8 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.24)] outline-none transition duration-150 data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100">
          <DialogPrimitive.Close
            aria-label="Đóng hộp thoại"
            className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogPrimitive.Close>

          <div className="relative mx-auto flex size-32 items-center justify-center">
            {dotPositions.map((pos, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn("absolute rounded-full", pos, colors[i % colors.length])}
              />
            ))}
            <div
              className={cn(
                "grid size-24 place-items-center rounded-full",
                tone === "success" ? "bg-emerald-50" : "bg-red-50",
              )}
            >
              <Icon
                strokeWidth={3}
                className={cn("size-10", tone === "success" ? "text-emerald-500" : "text-red-500")}
              />
            </div>
          </div>

          <DialogPrimitive.Title className="mt-6 text-xl font-extrabold text-slate-900">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-slate-500">
            {description}
          </DialogPrimitive.Description>

          <DialogPrimitive.Close
            className="mx-auto mt-7 flex h-12 w-full max-w-[220px] items-center justify-center rounded-full bg-primary text-sm font-bold text-white transition hover:bg-primary/90"
          >
            {closeLabel}
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
