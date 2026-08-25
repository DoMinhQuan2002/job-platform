"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import type { DetailedApplication } from "../types";
import { CandidateNavSidebar } from "../components/candidate-nav-sidebar";
import { ApplicationDetailTimeline } from "../components/application-detail-timeline";
import { ApplicationDetailSidebar } from "../components/application-detail-sidebar";
import { WithdrawModal } from "../components/withdraw-modal";
import { applicationsApi } from "../api";


const MOCK_APPLICATION_DETAIL: DetailedApplication = {
  id: "app-2024-0520-0001",
  code: "#APP-2024-0520-0001",
  appliedAt: "20/05/2024, 10:30",
  statusText: "Đang xem xét hồ sơ",
  status: "VIEWED",
  jobTitle: "Chuyên viên Digital Marketing",
  department: "Marketing",
  workplaceType: "Toàn thời gian",
  location: "Hà Nội",
  expectedSalary: "15 - 20 triệu VND",
  coverLetterName: "Thu_xin_viec_Nguyen_Thi_Mai.pdf",
  resumeName: "CV_Nguyen_Thi_Mai.pdf",
  company: {
    name: "Công ty Cổ phần FPT",
    logoUrl: "",
    website: "www.fpt.com",
  },
  jobSummary: {
    title: "Chuyên viên Digital Marketing",
    jobType: "Toàn thời gian",
    location: "Hà Nội",
    salary: "15 - 20 triệu VND",
    experience: "2 - 4 năm kinh nghiệm",
    postedDate: "15/05/2024",
    deadline: "15/06/2024",
  },
  timeline: [
    {
      title: "Ứng tuyển thành công",
      description: "Hệ thống đã ghi nhận đơn ứng tuyển của bạn.",
      time: "20/05/2024, 10:30",
      status: "COMPLETED",
    },
    {
      title: "Đang xem xét hồ sơ",
      description: "Nhà tuyển dụng đang xem xét hồ sơ của bạn.",
      time: "20/05/2024, 14:15",
      status: "CURRENT",
    },
    {
      title: "Phỏng vấn",
      description: "Bạn sẽ được thông báo khi đạt yêu cầu phỏng vấn.",
      time: "--",
      status: "PENDING",
    },
    {
      title: "Kết quả",
      description: "Chờ thông báo kết quả từ nhà tuyển dụng.",
      time: "--",
      status: "PENDING",
    },
  ],
};

interface ApplicationDetailPageProps {
  initialData?: DetailedApplication;
}

export function ApplicationDetailPage({
  initialData = MOCK_APPLICATION_DETAIL,
}: ApplicationDetailPageProps) {
  const params = useParams();
  const appId = (params?.id as string) || initialData.id;
  const [application, setApplication] = useState<DetailedApplication>(initialData);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!appId || appId.startsWith("app-2024")) return;

    const fetchDetail = async () => {
      try {
        const res = await applicationsApi.getById(appId);
        if (res && res.data) {
          const item = res.data as unknown as Record<string, unknown>;
          const rawStatus = (item.status as string) || "VIEWED";
          setApplication((prev) => ({
            ...prev,
            id: String(item.id),
            code: `#APP-${String(item.id).slice(0, 8).toUpperCase()}`,
            appliedAt: item.appliedAt
              ? new Date(String(item.appliedAt)).toLocaleString("vi-VN")
              : prev.appliedAt,
            status: rawStatus as DetailedApplication["status"],
            statusText:
              rawStatus === "APPLIED"
                ? "Đã nộp đơn"
                : rawStatus === "VIEWED"
                ? "Đang xem xét hồ sơ"
                : rawStatus === "INTERVIEW"
                ? "Mời phỏng vấn"
                : rawStatus === "ACCEPTED"
                ? "Trúng tuyển"
                : rawStatus === "REJECTED"
                ? "Từ chối"
                : "Đã rút đơn",
          }));
        }

      } catch {
        // Fall back to sample state
      }
    };

    fetchDetail();
  }, [appId]);


  const handleWithdrawSuccess = () => {
    setApplication((prev) => ({
      ...prev,
      status: "WITHDRAWN",
      statusText: "Đã rút đơn ứng tuyển",
      timeline: [
        ...prev.timeline,
        {
          title: "Đã rút đơn ứng tuyển",
          description: "Bạn đã chủ động rút đơn ứng tuyển vị trí này.",
          time: "Vừa xong",
          status: "COMPLETED",
        },
      ],
    }));
  };

  const handleViewFile = (fileName: string) => {
    alert(`Đang mở tệp xem trước: ${fileName}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 3-Column Layout: Sidebar trái (3/12) + Main (6/12) + Sidebar phải (3/12) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Candidate Nav Sidebar (~3/12) */}
          <div className="lg:col-span-3">
            <CandidateNavSidebar />
          </div>

          {/* Center: Main Application Details (~6/12) */}
          <div className="space-y-6 lg:col-span-6">
            {/* Back link */}
            <Link
              href="/candidate/applications"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại danh sách đơn ứng tuyển</span>
            </Link>

            {/* Title & Metadata */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Chi tiết đơn ứng tuyển
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                ID đơn: <span className="font-semibold text-slate-700">{application.code}</span> • Ứng tuyển ngày {application.appliedAt}
              </p>
            </div>

            {/* Current Status Banner */}
            <div
              className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs sm:text-sm font-bold border transition ${
                application.status === "WITHDRAWN"
                  ? "bg-rose-50 text-rose-800 border-rose-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>Trạng thái hiện tại: {application.statusText}</span>
            </div>

            {/* Card 1: Thông tin đơn ứng tuyển */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 space-y-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Thông tin đơn ứng tuyển
              </h3>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Vị trí ứng tuyển</span>
                  <span className="font-bold text-slate-900 text-right">
                    {application.jobTitle}
                  </span>
                </div>

                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Phòng ban</span>
                  <span className="font-bold text-slate-900 text-right">
                    {application.department}
                  </span>
                </div>

                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Hình thức làm việc</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {application.workplaceType}
                  </span>
                </div>

                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Địa điểm làm việc</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {application.location}
                  </span>
                </div>

                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Mức lương mong muốn</span>
                  <span className="font-bold text-slate-900 text-right">
                    {application.expectedSalary}
                  </span>
                </div>

                <div className="py-3 flex justify-between gap-4 items-center">
                  <span className="text-slate-500">Thư xin việc</span>
                  <button
                    type="button"
                    onClick={() => handleViewFile(application.coverLetterName)}
                    className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-xs"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{application.coverLetterName}</span>
                  </button>
                </div>

                <div className="py-3 flex justify-between gap-4 items-center">
                  <span className="text-slate-500">CV đính kèm</span>
                  <button
                    type="button"
                    onClick={() => handleViewFile(application.resumeName)}
                    className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline text-xs"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{application.resumeName}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Lộ trình xử lý đơn */}
            <ApplicationDetailTimeline timeline={application.timeline} />
          </div>

          {/* Right: Job Summary & Action Sidebar (~3/12) */}
          <div className="lg:col-span-3">
            <ApplicationDetailSidebar
              application={application}
              onOpenWithdraw={() => setIsWithdrawOpen(true)}
              onViewCV={() => handleViewFile(application.resumeName)}
            />
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        applicationId={application.id}
        jobTitle={application.jobTitle}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
