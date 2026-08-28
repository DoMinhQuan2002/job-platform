"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle,
  FileText,
  FolderOpen,
  Info,
  Send,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthSession } from "@/lib/use-auth-session";
import { resumeApi } from "@/modules/resume/api";
import type { Resume } from "@/modules/resume/types";
import { applicationsApi } from "../api";
import { Button } from "@/components/ui/button";

type ResumeChoice = {
  id: string;
  name: string;
  updatedAt: string;
  size: string;
  isDefault: boolean;
};

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toChoice(r: Resume): ResumeChoice {
  return {
    id: r.id,
    name: r.fileName || "CV ứng tuyển.pdf",
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString("vi-VN") : "—",
    size: formatFileSize(r.fileSize),
    isDefault: Boolean(r.isDefault),
  };
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location?: string;
  salary?: string;
  onApplySuccess?: (applicationId?: string) => void;
  hasApplied?: boolean;
}

export function ApplyModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  companyLogoUrl,
  location = "Hà Nội",
  salary = "20 - 30 triệu VND",
  onApplySuccess,
  hasApplied = false,
}: ApplyModalProps) {
  const { isRecruiter } = useAuthSession();
  const [resumeList, setResumeList] = useState<ResumeChoice[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const fetchMyResumes = async () => {
      setLoadingResumes(true);
      setError(null);
      try {
        const res = await resumeApi.list();
        if (cancelled) return;
        const mapped = (res.data ?? []).map(toChoice);
        const unique = Array.from(new Map(mapped.map((item) => [item.id, item])).values());
        setResumeList(unique);
        const defaultCv = unique.find((item) => item.isDefault) || unique[0];
        setSelectedResumeId(defaultCv?.id ?? "");
        if (unique.length === 0) {
          setError("Bạn chưa có CV. Hãy tải lên CV trước khi ứng tuyển.");
        }
      } catch {
        if (!cancelled) {
          setResumeList([]);
          setSelectedResumeId("");
          setError("Không tải được danh sách CV. Hãy đăng nhập và thử lại.");
        }
      } finally {
        if (!cancelled) setLoadingResumes(false);
      }
    };

    void fetchMyResumes();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (isRecruiter) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-900">Không thể ứng tuyển</h2>
          <p className="mt-2 text-sm text-muted">
            Tài khoản nhà tuyển dụng không thể ứng tuyển tin tuyển dụng này.
          </p>
          <div className="mt-5 flex justify-end">
            <Button type="button" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError("Vui lòng chọn một CV để ứng tuyển.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await applicationsApi.apply(jobId, { resumeId: selectedResumeId });
      setIsSuccess(true);
      onApplySuccess?.(response.data?.id);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ứng tuyển thất bại. Vui lòng thử lại hoặc kiểm tra kết nối.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative my-8 w-full max-w-[620px] rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Ứng tuyển vị trí</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ứng tuyển thành công!</h3>
            <p className="mt-2 text-sm text-slate-600">
              Hồ sơ của bạn đã được gửi đến nhà tuyển dụng{" "}
              <span className="font-semibold text-slate-800">{companyName}</span> cho vị trí{" "}
              <span className="font-semibold text-slate-800">{jobTitle}</span>.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleClose}
                className="rounded-xl bg-primary px-8 py-2.5 font-medium text-white shadow-xs hover:bg-primary-hover"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
                  {companyLogoUrl ? (
                    <img
                      src={companyLogoUrl}
                      alt={companyName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-primary italic">
                      JP
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-slate-900 sm:text-base">{jobTitle}</h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">{companyName}</span>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 fill-emerald-500 text-white" />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>📍 {location}</span>
                    <span>💵 {salary}</span>
                  </div>
                </div>
              </div>
            </div>

            {error || hasApplied ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <span>{error ?? "Bạn đã ứng tuyển công việc này rồi."}</span>
              </div>
            ) : null}

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">1. Chọn CV ứng tuyển</h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  Nhà tuyển dụng sẽ xem CV này khi bạn ứng tuyển.
                </p>
              </div>

              {loadingResumes ? (
                <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải CV...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {resumeList.map((cv) => {
                    const isSelected = selectedResumeId === cv.id;
                    return (
                      <div
                        key={cv.id}
                        onClick={() => setSelectedResumeId(cv.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-primary bg-white shadow-2xs ring-1 ring-primary"
                            : "border-slate-200/90 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected ? (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            ) : null}
                          </div>
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? "bg-blue-100 text-primary"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="line-clamp-1 text-xs font-bold text-slate-900 sm:text-sm">
                                {cv.name}
                              </span>
                              {cv.isDefault ? (
                                <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                  Mặc định
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Cập nhật: {cv.updatedAt} • {cv.size}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={ROUTES.resume.root}
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-blue-100"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Quản lý CV</span>
                </Link>
                <span className="text-xs text-slate-500">Tải lên, thêm hoặc xóa CV của bạn</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl bg-blue-50/80 p-3.5 text-xs text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="leading-relaxed">
                <span className="font-bold">Lưu ý:</span> Hãy chọn CV phù hợp nhất với mô tả công
                việc. Bạn có thể cập nhật CV trong mục Quản lý CV trước khi ứng tuyển.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl border-slate-200 px-6 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:text-sm"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedResumeId || hasApplied}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover sm:text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 rotate-[-20deg]" />
                )}
                <span>Xác nhận ứng tuyển</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-slate-400">
              <Lock className="h-3 w-3" />
              <span>Thông tin của bạn được bảo mật và chỉ sử dụng cho mục đích tuyển dụng.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
