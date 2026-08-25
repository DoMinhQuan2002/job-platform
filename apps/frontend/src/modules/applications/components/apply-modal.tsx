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
import { applicationsApi } from "../api";
import { Button } from "@/components/ui/button";

export interface ResumeOption {
  id: string;
  name: string;
  updatedAt: string;
  size: string;
  isDefault?: boolean;
  fileUrl?: string;
  title?: string;
  fileName?: string;
  fileSize?: string;
  storagePath?: string;
}


const MOCK_RESUMES: ResumeOption[] = [
  {
    id: "resume-1",
    name: "Nguyễn Văn A - CV Frontend.pdf",
    updatedAt: "20/04/2025",
    size: "512 KB",
    isDefault: true,
  },
  {
    id: "resume-2",
    name: "Nguyễn Văn A - CV Fullstack.pdf",
    updatedAt: "15/02/2025",
    size: "420 KB",
    isDefault: false,
  },
  {
    id: "resume-3",
    name: "Nguyễn Văn A - CV Fresher.pdf",
    updatedAt: "02/01/2025",
    size: "380 KB",
    isDefault: false,
  },
];

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location?: string;
  salary?: string;
  resumes?: ResumeOption[];
  onApplySuccess?: () => void;
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
  resumes: initialResumes = MOCK_RESUMES,
  onApplySuccess,
}: ApplyModalProps) {
  const [resumeList, setResumeList] = useState<ResumeOption[]>(initialResumes);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    initialResumes.find((r) => r.isDefault)?.id || initialResumes[0]?.id || ""
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMyResumes = async () => {
      try {
        const res = await applicationsApi.getMyResumes();
        if (res && res.data && res.data.length > 0) {
          const mapped: ResumeOption[] = res.data.map((r: ResumeOption) => ({
            id: String(r.id),
            name: String(r.title || r.name || r.fileName || "CV ứng tuyển.pdf"),
            updatedAt: r.updatedAt
              ? new Date(String(r.updatedAt)).toLocaleDateString("vi-VN")
              : "Hôm nay",
            size: String(r.fileSize || r.size || "500 KB"),
            isDefault: Boolean(r.isDefault),
            fileUrl: r.fileUrl || r.storagePath,
          }));
          setResumeList(mapped);
          const defaultCv = mapped.find((item) => item.isDefault) || mapped[0];
          if (defaultCv) {
            setSelectedResumeId(defaultCv.id);
          }
        }
      } catch {
        // Use default mock list
      }
    };


    fetchMyResumes();
  }, [isOpen]);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError("Vui lòng chọn một CV để ứng tuyển.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await applicationsApi.apply(jobId, {
        resumeId: selectedResumeId,
      });
      setIsSuccess(true);
      if (onApplySuccess) {
        onApplySuccess();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Ứng tuyển thất bại. Vui lòng thử lại hoặc kiểm tra kết nối.";
      setError(errorMsg);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative my-8 w-full max-w-[620px] rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Ứng tuyển vị trí</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
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
                className="rounded-xl bg-primary px-8 py-2.5 font-medium text-white hover:bg-primary-hover shadow-xs"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Summary Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                {/* Logo */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xs">
                  {companyLogoUrl ? (
                    <img src={companyLogoUrl} alt={companyName} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-blue-50 font-bold text-primary italic text-sm">
                      FPT.
                    </div>
                  )}
                </div>

                {/* Job & Company title */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 sm:text-base truncate">{jobTitle}</h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">{companyName}</span>
                    <CheckCircle className="h-3.5 w-3.5 fill-emerald-500 text-white shrink-0" />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">📍 {location}</span>
                    <span className="flex items-center gap-1">💵 {salary}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Chọn CV ứng tuyển */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">1. Chọn CV ứng tuyển</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhà tuyển dụng sẽ xem CV này khi bạn ứng tuyển.
                </p>
              </div>

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
                        {/* Radio indicator */}
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                            isSelected ? "border-primary bg-primary" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>

                        {/* PDF Icon */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isSelected ? "bg-blue-100 text-primary" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>

                        {/* CV Details */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                              {cv.name}
                            </span>
                            {cv.isDefault && (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-100">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Cập nhật: {cv.updatedAt} • {cv.size}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Đang mở bản xem trước của: ${cv.name}`);
                            }}
                            className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <Info className="h-3 w-3" />
                            <span>Xem trước</span>
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quản lý CV */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/candidate/resume"
                  target="_blank"
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-blue-100"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Quản lý CV</span>
                </Link>
                <span className="text-xs text-slate-500">Tải lên, thêm hoặc xóa CV của bạn</span>
              </div>
            </div>

            {/* 2. Ghi chú thêm (không bắt buộc) */}
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  2. Ghi chú thêm <span className="text-xs font-normal text-slate-500">(không bắt buộc)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có thể giới thiệu thêm về bản thân hoặc lý do ứng tuyển vị trí này...
                </p>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú của bạn tại đây..."
                  className="w-full rounded-2xl border border-slate-200 p-3 pb-6 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">
                  {note.length}/500
                </span>
              </div>
            </div>

            {/* Lưu ý */}
            <div className="flex items-start gap-2.5 rounded-2xl bg-blue-50/80 p-3.5 text-xs text-blue-900">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-bold">Lưu ý:</span> Hãy chọn CV phù hợp nhất với vị trí ứng tuyển để tăng cơ hội được nhà tuyển dụng chú ý.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl border-slate-200 px-6 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover shadow-xs"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 rotate-[-20deg]" />
                )}
                <span>Xác nhận ứng tuyển</span>
              </Button>
            </div>

            {/* Privacy Subtext */}
            <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 pt-1">
              <Lock className="h-3 w-3" />
              <span>Thông tin của bạn được bảo mật và chỉ sử dụng cho mục đích tuyển dụng.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
