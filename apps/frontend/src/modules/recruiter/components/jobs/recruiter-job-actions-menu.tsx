"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Ellipsis, Eye, EyeOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { recruiterJobsApi, type RecruiterJob } from "@/services/recruiter-jobs.service";

interface RecruiterJobActionsMenuProps {
  job: RecruiterJob;
  onStatusChange?: () => void;
}

export function RecruiterJobActionsMenu({ job, onStatusChange }: RecruiterJobActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<"OPEN" | "HIDDEN" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 85;
    const menuWidth = 176;

    // Khoảng cách bên dưới màn hình
    const spaceBelowWindow = window.innerHeight - rect.bottom;

    // Khoảng cách bên dưới container bảng (tránh bị che bởi mép dưới bảng)
    const container =
      buttonRef.current.closest(".overflow-x-auto") ||
      buttonRef.current.closest("table") ||
      buttonRef.current.closest("section");
    const containerRect = container?.getBoundingClientRect();
    const spaceBelowContainer = containerRect ? containerRect.bottom - rect.bottom : spaceBelowWindow;

    // Nếu khoảng trống phía dưới màn hình hoặc mép bảng < 95px thì tự động bật lên TRÊN
    const placeTop = spaceBelowWindow < menuHeight + 20 || spaceBelowContainer < menuHeight + 15;

    const top = placeTop
      ? Math.max(8, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 6);

    const left = Math.max(
      8,
      Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth)
    );

    return {
      top,
      left,
      placement: placeTop ? ("top" as const) : ("bottom" as const),
    };
  }, []);

  const toggleMenu = () => {
    if (!isOpen) {
      const pos = calculatePosition();
      setMenuPos(pos);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const canHide = job.status === "OPEN" || job.status === "APPROVED";
  const isAlreadyHidden = job.status === "HIDDEN";
  const canShow = job.status === "HIDDEN" || job.status === "APPROVED" || job.status === "CLOSED";
  const isAlreadyOpen = job.status === "OPEN";

  const handleOpenConfirm = (action: "OPEN" | "HIDDEN") => {
    setIsOpen(false);
    setConfirmAction(action);
  };

  const handleConfirmSubmit = async () => {
    if (!confirmAction) return;
    setIsSubmitting(true);
    try {
      await recruiterJobsApi.updateStatus(job.id, confirmAction);
      toast.success(
        confirmAction === "HIDDEN"
          ? "Đã ẩn tin tuyển dụng thành công"
          : "Đã mở lại tin tuyển dụng thành công"
      );
      setConfirmAction(null);
      onStatusChange?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật trạng thái tin"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRestricted = job.status === "PENDING" || job.status === "REJECTED";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={isRestricted}
        title={
          isRestricted
            ? "Tin đang chờ duyệt hoặc bị từ chối không thể thay đổi trạng thái"
            : "Thao tác khác"
        }
        aria-label="Thao tác khác"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className={`grid size-8 place-items-center rounded-full border border-border transition focus:outline-none ${
          isRestricted
            ? "cursor-not-allowed text-muted/30 opacity-60"
            : "cursor-pointer text-muted hover:bg-background hover:text-primary"
        }`}
      >
        <Ellipsis className="size-3.5" />
      </button>

      {/* Dropdown Menu gắn qua Portal trực tiếp vào body để không bao giờ bị cắt bởi overflow */}
      {mounted && isOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            zIndex: 9999,
          }}
          className={`w-44 rounded-lg border border-border bg-surface p-1 shadow-2xl ring-1 ring-black/10 animate-in fade-in zoom-in-95 ${
            menuPos.placement === "top" ? "origin-bottom-right" : "origin-top-right"
          }`}
        >
          <div className="py-0.5 text-xs text-text">
            {/* Option 1: Ẩn tin */}
            <button
              type="button"
              disabled={!canHide}
              onClick={() => handleOpenConfirm("HIDDEN")}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                canHide
                  ? "cursor-pointer text-text hover:bg-background hover:text-warning"
                  : "cursor-not-allowed text-muted/40"
              }`}
            >
              <EyeOff className="size-3.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span>Ẩn tin</span>
                {isAlreadyHidden && (
                  <span className="block text-[10px] text-muted/60">(Đang ẩn)</span>
                )}
              </div>
            </button>

            {/* Option 2: Hiện tin */}
            <button
              type="button"
              disabled={!canShow}
              onClick={() => handleOpenConfirm("OPEN")}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                canShow
                  ? "cursor-pointer text-text hover:bg-background hover:text-success"
                  : "cursor-not-allowed text-muted/40"
              }`}
            >
              <Eye className="size-3.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span>Hiện tin</span>
                {isAlreadyOpen && (
                  <span className="block text-[10px] text-muted/60">(Đang tuyển)</span>
                )}
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-9 place-items-center rounded-full ${
                    confirmAction === "HIDDEN"
                      ? "bg-warning/15 text-warning"
                      : "bg-success/15 text-success"
                  }`}
                >
                  {confirmAction === "HIDDEN" ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <CheckCircle2 className="size-5" />
                  )}
                </span>
                <h3 className="text-sm font-semibold text-text">
                  {confirmAction === "HIDDEN" ? "Ẩn tin tuyển dụng" : "Hiện tin tuyển dụng"}
                </h3>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmAction(null)}
                className="cursor-pointer rounded-md p-1 text-muted hover:bg-background hover:text-text disabled:cursor-not-allowed"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              {confirmAction === "HIDDEN"
                ? `Bạn có chắc chắn muốn ẩn tin "${job.title}"? Tin sẽ không còn hiển thị công khai trên cổng tìm việc cho đến khi bạn mở lại.`
                : `Bạn có muốn hiển thị lại tin "${job.title}"? Tin sẽ chuyển sang trạng thái "Đang tuyển" và hiển thị công khai cho ứng viên nộp hồ sơ.`}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setConfirmAction(null)}
                className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  confirmAction === "HIDDEN"
                    ? "bg-warning hover:bg-warning/90"
                    : "bg-primary hover:bg-primary-hover"
                }`}
              >
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                {confirmAction === "HIDDEN" ? "Xác nhận ẩn" : "Xác nhận hiện"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
