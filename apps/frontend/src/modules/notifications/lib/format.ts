import { Bell, Briefcase, Building2, Mail, UserCheck } from "lucide-react";
import type { NotificationType } from "../types";

/** Nhãn hiển thị nhóm — dùng cho card "Loại thông báo" ở trang chi tiết */
export const NOTIFICATION_LABEL: Record<NotificationType, string> = {
  ACCOUNT_LOCKED: "Tài khoản",
  ACCOUNT_UNLOCKED: "Tài khoản",
  COMPANY_LOCKED: "Công ty",
  COMPANY_UNLOCKED: "Công ty",
  COMPANY_APPROVED: "Công ty",
  COMPANY_REJECTED: "Công ty",
  JOB_APPROVED: "Tin tuyển dụng",
  JOB_REJECTED: "Tin tuyển dụng",
  JOB_DELETED: "Tin tuyển dụng",
  NEW_APPLICATION: "Ứng tuyển",
  APPLICATION_STATUS_CHANGED: "Ứng tuyển",
};

export const NOTIFICATION_ICON: Record<NotificationType, typeof Bell> = {
  ACCOUNT_LOCKED: UserCheck,
  ACCOUNT_UNLOCKED: UserCheck,
  COMPANY_LOCKED: Building2,
  COMPANY_UNLOCKED: Building2,
  COMPANY_APPROVED: Building2,
  COMPANY_REJECTED: Building2,
  JOB_APPROVED: Briefcase,
  JOB_REJECTED: Briefcase,
  JOB_DELETED: Briefcase,
  NEW_APPLICATION: Mail,
  APPLICATION_STATUS_CHANGED: Mail,
};

/** Icon nền màu theo type — gần với sắc độ trong Figma (xanh lá = tích cực, đỏ = tiêu cực) */
export function notificationIconClass(type: NotificationType): string {
  switch (type) {
    case "ACCOUNT_LOCKED":
    case "COMPANY_LOCKED":
    case "COMPANY_REJECTED":
    case "JOB_REJECTED":
    case "JOB_DELETED":
      return "bg-rose-50 text-rose-600";
    case "ACCOUNT_UNLOCKED":
    case "COMPANY_UNLOCKED":
    case "COMPANY_APPROVED":
    case "JOB_APPROVED":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-blue-50 text-primary";
  }
}

/**
 * Nhóm tab cho màn ứng viên. Ứng viên chỉ thực sự nhận ACCOUNT_(LOCKED|UNLOCKED)
 * và APPLICATION_STATUS_CHANGED — NEW_APPLICATION, COMPANY_..., JOB_... chỉ gửi
 * cho nhà tuyển dụng nên không đưa vào tab "Việc làm" ở đây.
 */
export const CANDIDATE_NOTIFICATION_TABS: Array<{
  value: string;
  label: string;
  types?: NotificationType[];
}> = [
  { value: "ALL", label: "Tất cả" },
  { value: "APPLICATION", label: "Ứng tuyển", types: ["APPLICATION_STATUS_CHANGED"] },
];

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

/** "5 phút trước" / "2 giờ trước" / "3 ngày trước", rơi về ngày/giờ cụ thể khi > 30 ngày */
export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return formatDateTime(iso);
}
