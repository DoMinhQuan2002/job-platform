"use client";

import React, { useState } from "react";
import { FileText, Star, Download, Eye, Trash2, Loader2 } from "lucide-react";
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleDelete = () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      setIsDeleting(true);
      await onDelete(resume.id);
      toast.success("Xóa CV thành công!");
    } catch (error) {
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
    } catch (error) {
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border border-border rounded-xl mb-4 hover:border-primary/50 transition-all shadow-sm">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground text-base line-clamp-1 break-all">
              {resume.fileName}
            </h3>
            {resume.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-primary text-xs font-medium whitespace-nowrap">
                <Star className="w-3 h-3 fill-primary" /> Mặc định
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
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-success text-sm font-medium mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success mr-2"></span>
            Đang sử dụng
          </span>
        ) : (
          <Button
            variant="outline"
            className="rounded-full text-sm h-9 border-border text-foreground hover:bg-gray-50 mr-2"
            onClick={handleSetDefault}
            disabled={isSettingDefault}
          >
            <Star className="w-4 h-4 mr-2" />
            Đặt làm mặc định
          </Button>
        )}

        {/* Action icons */}
        <button
          onClick={() => handleAction("download")}
          disabled={!!fetchingAction}
          className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          title="Tải về"
        >
          {fetchingAction === "download" ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <Download className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={() => handleAction("view")}
          disabled={!!fetchingAction}
          className="flex items-center gap-1.5 p-2 px-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {fetchingAction === "view" ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Xem</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 border border-red-200 text-destructive rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-toastIn">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Xóa CV khỏi danh sách?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Hành động này sẽ xóa CV <span className="font-medium text-foreground">{resume.fileName}</span>. Bạn có chắc chắn không?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg px-5 border-gray-200 text-foreground hover:bg-gray-50"
              >
                No
              </Button>
              <Button
                onClick={confirmDelete}
                className="rounded-lg px-6 bg-red-500 text-white hover:bg-red-600 shadow-sm"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
