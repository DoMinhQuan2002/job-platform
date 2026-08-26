import type { ApplicationStatus, ApplicationTimelineStep } from "../types";

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: "Đã nộp đơn",
  VIEWED: "Đang xem xét",
  INTERVIEW: "Phỏng vấn",
  ACCEPTED: "Trúng tuyển",
  REJECTED: "Từ chối",
  WITHDRAWN: "Đã rút đơn",
};

export const STATUS_FILTERS: Array<{ value: ApplicationStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "APPLIED", label: "Đã nộp" },
  { value: "VIEWED", label: "Đang xem xét" },
  { value: "INTERVIEW", label: "Phỏng vấn" },
  { value: "ACCEPTED", label: "Trúng tuyển" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "WITHDRAWN", label: "Đã rút" },
];

export function canWithdraw(status: ApplicationStatus): boolean {
  return status === "APPLIED" || status === "VIEWED";
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString("vi-VN");
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString("vi-VN");
}

export function buildTimeline(
  status: ApplicationStatus,
  appliedAt: string,
): ApplicationTimelineStep[] {
  const appliedTime = formatDateTime(appliedAt);
  const order: ApplicationStatus[] = ["APPLIED", "VIEWED", "INTERVIEW", "ACCEPTED"];

  if (status === "WITHDRAWN") {
    return [
      {
        title: "Ứng tuyển thành công",
        description: "Hệ thống đã ghi nhận đơn ứng tuyển của bạn.",
        time: appliedTime,
        status: "COMPLETED",
      },
      {
        title: "Đã rút đơn",
        description: "Bạn đã chủ động rút đơn ứng tuyển.",
        time: "—",
        status: "CURRENT",
      },
    ];
  }

  if (status === "REJECTED") {
    return [
      {
        title: "Ứng tuyển thành công",
        description: "Hệ thống đã ghi nhận đơn ứng tuyển của bạn.",
        time: appliedTime,
        status: "COMPLETED",
      },
      {
        title: "Từ chối",
        description: "Nhà tuyển dụng đã từ chối đơn của bạn.",
        time: "—",
        status: "CURRENT",
      },
    ];
  }

  const currentIndex = order.indexOf(status);

  const steps: Array<{ title: string; description: string; key: ApplicationStatus }> = [
    {
      key: "APPLIED",
      title: "Ứng tuyển thành công",
      description: "Hệ thống đã ghi nhận đơn ứng tuyển của bạn.",
    },
    {
      key: "VIEWED",
      title: "Đang xem xét hồ sơ",
      description: "Nhà tuyển dụng đang xem xét hồ sơ của bạn.",
    },
    {
      key: "INTERVIEW",
      title: "Phỏng vấn",
      description: "Bạn sẽ được thông báo khi đạt yêu cầu phỏng vấn.",
    },
    {
      key: "ACCEPTED",
      title: "Kết quả",
      description: "Chờ thông báo kết quả từ nhà tuyển dụng.",
    },
  ];

  return steps.map((step, index) => {
    let stepStatus: ApplicationTimelineStep["status"] = "PENDING";
    if (index < currentIndex) stepStatus = "COMPLETED";
    if (index === currentIndex) stepStatus = "CURRENT";
    if (status === "ACCEPTED" && index === steps.length - 1) stepStatus = "COMPLETED";

    return {
      title: step.title,
      description: step.description,
      time: index === 0 ? appliedTime : "—",
      status: stepStatus,
    };
  });
}
