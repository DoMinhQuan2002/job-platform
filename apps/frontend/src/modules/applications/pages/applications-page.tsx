"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  MoreHorizontal,
  Info,
  Trash2,
} from "lucide-react";
import type { ApplicationTemplate } from "../types";
import { CandidateNavSidebar } from "../components/candidate-nav-sidebar";
import { SuggestedTemplates, type TemplateSuggestion } from "../components/suggested-templates";
import { ApplicationTemplateModal } from "../components/application-template-modal";
import { Button } from "@/components/ui/button";

const INITIAL_TEMPLATES: ApplicationTemplate[] = [
  {
    id: "tpl-1",
    title: "Đơn ứng tuyển vị trí Marketing",
    description: "Đơn ứng tuyển cho các vị trí trong lĩnh vực Marketing, Truyền thông, Digital Marketing.",
    content:
      "Kính gửi Quý Nhà tuyển dụng,\n\nTôi viết đơn này để bày tỏ sự quan tâm đặc biệt tới vị trí Marketing tại Quý công ty. Với hơn 2 năm kinh nghiệm trong lĩnh vực Digital Marketing, xây dựng nội dung đa kênh và tối ưu hóa chuyển đổi, tôi tin rằng năng lực của mình sẽ đóng góp tích cực vào mục tiêu tăng trưởng của công ty.\n\nRất mong có cơ hội được trao đổi chi tiết hơn trong buổi phỏng vấn sắp tới.\n\nTrân trọng,\nNguyễn Thị Mai",
    status: "USED",
    updatedAt: "20/05/2024",
    lastUsedAt: "20/05/2024",
    category: "Marketing",
  },
  {
    id: "tpl-2",
    title: "Đơn ứng tuyển vị trí Kinh doanh",
    description: "Sử dụng cho các vị trí Sales, Business Development, Account Manager.",
    content:
      "Kính gửi Quý Nhà tuyển dụng,\n\nTôi rất hào hứng được ứng tuyển vào vị trí Chuyên viên Kinh doanh / Sales tại Quý công ty. Với thế mạnh về kỹ năng giao tiếp, đàm phán, tìm kiếm khách hàng tiềm năng và vượt chỉ tiêu doanh số liên tục trong các quý vừa qua, tôi tự tin sẽ mang lại giá trị thiết thực cho đội ngũ kinh doanh.\n\nTrân trọng cảm ơn Quý công ty đã dành thời gian xem xét hồ sơ của tôi.\n\nTrân trọng,\nNguyễn Thị Mai",
    status: "USED",
    updatedAt: "10/04/2024",
    lastUsedAt: "15/04/2024",
    category: "Kinh doanh",
  },
  {
    id: "tpl-3",
    title: "Đơn ứng tuyển vị trí Thực tập sinh",
    description: "Dành cho các vị trí thực tập, fresher, sinh viên mới tốt nghiệp.",
    content:
      "Kính gửi Quý Nhà tuyển dụng,\n\nTôi là sinh viên năm cuối chuyên ngành Công nghệ thông tin / Kinh tế. Với tinh thần ham học hỏi, chủ động và nền tảng kiến thức vững vàng, tôi mong muốn có cơ hội được thực tập và cống hiến tại môi trường làm việc chuyên nghiệp của Quý công ty.\n\nXin chân thành cảm ơn,\nNguyễn Thị Mai",
    status: "DRAFT",
    updatedAt: "15/03/2024",
    lastUsedAt: null,
    category: "Thực tập sinh",
  },
];

export function ApplicationsPage() {
  const [templates, setTemplates] = useState<ApplicationTemplate[]>(INITIAL_TEMPLATES);
  const [activeTab, setActiveTab] = useState<"ALL" | "USED" | "DRAFT">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ApplicationTemplate | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const usedCount = templates.filter((t) => t.status === "USED").length;
  const draftCount = templates.filter((t) => t.status === "DRAFT").length;

  const filteredTemplates = templates.filter((t) => {
    if (activeTab === "USED") return t.status === "USED";
    if (activeTab === "DRAFT") return t.status === "DRAFT";
    return true;
  });

  const handleSaveTemplate = (saved: ApplicationTemplate) => {
    setTemplates((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) {
        return prev.map((item) => (item.id === saved.id ? saved : item));
      }
      return [saved, ...prev];
    });
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mẫu đơn ứng tuyển này?")) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setOpenActionId(null);
    }
  };

  const handleUseSuggested = (sug: TemplateSuggestion) => {
    setEditingTemplate({
      id: `tpl-${Date.now()}`,
      title: `Đơn ứng tuyển vị trí ${sug.title}`,
      description: sug.description,
      content: sug.defaultContent,
      status: "DRAFT",
      updatedAt: "Hôm nay",
      lastUsedAt: null,
      category: sug.category,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Layout 2 cột: Sidebar trái (3/12) + Nội dung chính (9/12) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Candidate Navigation Sidebar */}
          <div className="lg:col-span-3">
            <CandidateNavSidebar />
          </div>

          {/* Right Column: Main Content */}
          <div className="space-y-6 lg:col-span-9">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="flex items-center gap-1 hover:text-primary transition">
                <Home className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">Đơn ứng tuyển</span>
            </nav>

            {/* Header: Title + Create Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Đơn ứng tuyển
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Tạo và quản lý các mẫu đơn ứng tuyển của bạn.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo đơn mới</span>
              </Button>
            </div>

            {/* Main Application Table Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 space-y-6">
              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-100 pb-3 text-xs sm:text-sm">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`font-bold pb-3 -mb-3 transition border-b-2 ${
                    activeTab === "ALL"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả ({templates.length})
                </button>
                <button
                  onClick={() => setActiveTab("USED")}
                  className={`font-bold pb-3 -mb-3 transition border-b-2 ${
                    activeTab === "USED"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đã sử dụng ({usedCount})
                </button>
                <button
                  onClick={() => setActiveTab("DRAFT")}
                  className={`font-bold pb-3 -mb-3 transition border-b-2 ${
                    activeTab === "DRAFT"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Nháp ({draftCount})
                </button>
              </div>

              {/* Table List Header */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
                <div className="col-span-5">Tiêu đề</div>
                <div className="col-span-2 text-center">Trạng thái</div>
                <div className="col-span-2 text-center">Cập nhật</div>
                <div className="col-span-2 text-center">Sử dụng lần cuối</div>
                <div className="col-span-1 text-right">Thao tác</div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {filteredTemplates.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                    Không có mẫu đơn ứng tuyển nào trong mục này.
                  </div>
                ) : (
                  filteredTemplates.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center rounded-2xl border border-slate-200/90 p-4 transition-all hover:border-slate-300 hover:shadow-2xs bg-white"
                    >
                      {/* Tiêu đề + Mô tả */}
                      <div className="sm:col-span-5 flex items-start gap-3 w-full">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/candidate/applications/${item.id}`}>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition truncate hover:underline cursor-pointer">
                              {item.title}
                            </h4>
                          </Link>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Trạng thái */}
                      <div className="sm:col-span-2 flex sm:justify-center w-full sm:w-auto">
                        {item.status === "USED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Đã sử dụng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 border border-amber-100">
                            <Clock className="h-3 w-3" />
                            <span>Nháp</span>
                          </span>
                        )}
                      </div>

                      {/* Cập nhật */}
                      <div className="sm:col-span-2 sm:text-center text-xs text-slate-600">
                        <span className="sm:hidden font-semibold text-slate-400 mr-2">Cập nhật:</span>
                        {item.updatedAt}
                      </div>

                      {/* Sử dụng lần cuối */}
                      <div className="sm:col-span-2 sm:text-center text-xs text-slate-600">
                        <span className="sm:hidden font-semibold text-slate-400 mr-2">Sử dụng lần cuối:</span>
                        {item.lastUsedAt || "-"}
                      </div>

                      {/* Thao tác (Eye, Edit, More) */}
                      <div className="sm:col-span-1 flex items-center sm:justify-end gap-1.5 self-end sm:self-auto">
                        <Link
                          href={`/candidate/applications/${item.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingTemplate(item);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenActionId(openActionId === item.id ? null : item.id)
                            }
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            title="Tùy chọn khác"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openActionId === item.id && (
                            <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in">
                              <button
                                onClick={() => handleDeleteTemplate(item.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Xóa mẫu</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mẫu đơn gợi ý */}
            <SuggestedTemplates onUseTemplate={handleUseSuggested} />

            {/* Bottom Info Banner */}
            <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 p-4 text-xs text-blue-900 border border-blue-100">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-bold">Lưu ý:</span> Đơn ứng tuyển sẽ được sử dụng khi bạn nộp hồ sơ cho các công việc. Bạn có thể chỉnh sửa nội dung phù hợp với từng vị trí cụ thể.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tạo/Sửa mẫu đơn */}
      <ApplicationTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTemplate(null);
        }}
        initialTemplate={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
