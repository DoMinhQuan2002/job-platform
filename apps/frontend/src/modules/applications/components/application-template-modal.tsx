"use client";

import { useState } from "react";
import { X, FileText, Check, Loader2 } from "lucide-react";

import type { ApplicationTemplate } from "../types";
import { Button } from "@/components/ui/button";

interface ApplicationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: ApplicationTemplate | null;
  onSave: (template: ApplicationTemplate) => void;
}

export function ApplicationTemplateModal({
  isOpen,
  onClose,
  initialTemplate,
  onSave,
}: ApplicationTemplateModalProps) {
  if (!isOpen) return null;

  return (
    <ApplicationTemplateForm
      initialTemplate={initialTemplate}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function ApplicationTemplateForm({
  initialTemplate,
  onClose,
  onSave,
}: {
  initialTemplate?: ApplicationTemplate | null;
  onClose: () => void;
  onSave: (template: ApplicationTemplate) => void;
}) {
  const [title, setTitle] = useState(initialTemplate?.title || "");
  const [description, setDescription] = useState(initialTemplate?.description || "");
  const [content, setContent] = useState(initialTemplate?.content || "");
  const [isDraft, setIsDraft] = useState(initialTemplate?.status === "DRAFT");
  const [loading, setLoading] = useState(false);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      const savedItem: ApplicationTemplate = {
        id: initialTemplate?.id || `tpl-${Date.now()}`,
        title: title.trim(),
        description:
          description.trim() ||
          "Đơn ứng tuyển được tùy chỉnh cho vị trí ứng tuyển.",
        content: content.trim(),
        status: isDraft ? "DRAFT" : "USED",
        updatedAt: dateStr,
        lastUsedAt: initialTemplate?.lastUsedAt || (isDraft ? null : dateStr),
      };

      onSave(savedItem);
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialTemplate ? "Chỉnh sửa mẫu đơn ứng tuyển" : "Tạo mẫu đơn ứng tuyển mới"}
              </h3>
              <p className="text-xs text-slate-500">
                Tạo nội dung mẫu để tái sử dụng nhanh khi nộp hồ sơ xin việc
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Tiêu đề mẫu đơn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đơn ứng tuyển vị trí Marketing..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Mô tả mục đích sử dụng
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Dành cho các vị trí Marketing, Truyền thông, Content..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Nội dung chi tiết */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Nội dung thư ứng tuyển (Cover letter)
            </label>
            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Kính gửi Quý Nhà tuyển dụng,..."
              className="w-full rounded-2xl border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Lưu dưới dạng bản nháp */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDraft"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isDraft" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Lưu dưới dạng bản nháp (chưa sẵn sàng sử dụng)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-200 px-5 py-2 text-xs sm:text-sm font-medium text-slate-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-6 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover shadow-xs flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Lưu mẫu đơn</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
