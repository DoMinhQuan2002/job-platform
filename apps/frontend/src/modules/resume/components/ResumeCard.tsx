"use client";

import React, { useState } from "react";
import { FileText, Star, Download, Eye, Trash2, Loader2 } from "lucide-react";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadFileFromUrl } from "@/lib/utils";
import { resumeApi } from "../api";
import type { Resume } from "../types";

interface ResumeCardProps {
  resume: Resume;
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onSetDefault,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [fetchingAction, setFetchingAction] = useState<"view" | "download" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(resume.id);
      toast.success("Xóa CV thành công!");
    } catch {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      setIsSettingDefault(true);
      await onSetDefault(resume.id);
      toast.success("Đã đặt CV làm mặc định!");
    } catch {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleAction = async (action: "view" | "download") => {
    if (!resume.fileUrl) {
      toast.error("CV chưa có đường dẫn lưu trữ.");
      return;
    }
    try {
      setFetchingAction(action);
      const res = await resumeApi.getAccessUrl(resume.fileUrl);
      const url = res.data?.url;
      if (!url) {
        toast.error("Không thể lấy đường dẫn file. Vui lòng thử lại.");
        return;
      }
      if (action === "download") {
        const downloadName = resume.fileName?.includes(".")
          ? resume.fileName
          : `${resume.fileName || "CV"}.pdf`;
        await downloadFileFromUrl(url, downloadName);
        toast.success("Đang tải CV về máy...");
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi lấy file.");
    } finally {
      setFetchingAction(null);
    }
  };

  return (
    <div className="mb-4 flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 sm:flex-row sm:items-center">
      <div className="mb-4 flex items-center gap-4 sm:mb-0">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
          <FileText className="h-6 w-6 text-red-500" strokeWidth={1.5} />
        </div>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="line-clamp-1 break-all text-base font-medium text-foreground">
              {resume.fileName}
            </h3>
            {resume.isDefault && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-primary">
                <Star className="h-3 w-3 fill-primary" /> Mặc định
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Cập nhật: {formatDate(resume.updatedAt)} • {formatSize(resume.fileSize)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {resume.isDefault ? (
          <span className="mr-2 inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-success">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-success" />
            Đang sử dụng
          </span>
        ) : (
          <Button
            variant="outline"
            className="mr-2 h-9 rounded-full border-border text-sm text-foreground hover:bg-gray-50"
            onClick={handleSetDefault}
            disabled={isSettingDefault}
          >
            <Star className="mr-2 h-4 w-4" />
            Đặt làm mặc định
          </Button>
        )}

        <button
          type="button"
          onClick={() => handleAction("download")}
          disabled={fetchingAction === "download"}
          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
          title="Tải về"
        >
          {fetchingAction === "download" ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Download className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleAction("view")}
          disabled={fetchingAction === "view"}
          className="flex items-center gap-1.5 rounded-lg border border-border p-2 px-3 text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground disabled:opacity-50"
        >
          {fetchingAction === "view" ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">Xem</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
          className="rounded-lg border border-red-200 p-2 text-destructive transition-colors hover:bg-red-50 disabled:opacity-50"
          title="Xóa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <AppAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="error"
        title="Xóa CV khỏi danh sách?"
        description={
          <>
            Hành động này sẽ xóa CV{" "}
            <span className="font-medium text-foreground">{resume.fileName}</span>.
            Bạn có chắc chắn không?
          </>
        }
        cancelLabel="Hủy"
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
      />
    </div>
  );
};
