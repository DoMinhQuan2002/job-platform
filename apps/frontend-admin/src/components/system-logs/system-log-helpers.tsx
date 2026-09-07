import {
  type LogActionType,
  type SystemLogItem,
} from "@/services/admin-system-logs.service";

export type ActivityCategory =
  | "ALL"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT";

export function getActionCategory(action: LogActionType): {
  key: ActivityCategory;
  label: string;
  badgeClass: string;
} {
  const act = String(action || "").toUpperCase();

  if (act.startsWith("CREATE") || act.includes("INSERT") || act.includes("ADD")) {
    return {
      key: "CREATE",
      label: "THÊM",
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
  }

  if (
    act.startsWith("UPDATE") ||
    act.startsWith("LOCK") ||
    act.startsWith("UNLOCK") ||
    act.startsWith("APPROVE") ||
    act.startsWith("REJECT") ||
    act.startsWith("EDIT") ||
    act.includes("CHANGE")
  ) {
    return {
      key: "UPDATE",
      label: "SỬA",
      badgeClass: "bg-amber-50 text-amber-600 border-amber-200",
    };
  }

  if (
    act.startsWith("DELETE") ||
    act.startsWith("REMOVE") ||
    act.includes("DESTROY")
  ) {
    return {
      key: "DELETE",
      label: "XÓA",
      badgeClass: "bg-rose-50 text-rose-600 border-rose-200",
    };
  }

  if (act.includes("LOGIN") || act.includes("AUTH")) {
    return {
      key: "LOGIN",
      label: "ĐĂNG NHẬP",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  if (act.includes("LOGOUT")) {
    return {
      key: "LOGOUT",
      label: "ĐĂNG XUẤT",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  return {
    key: "UPDATE",
    label: "SỬA",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

export function formatOperationName(action: LogActionType): string {
  const act = String(action || "").toUpperCase();
  switch (act) {
    case "LOCK_USER":
      return "Khóa tài khoản";
    case "UNLOCK_USER":
      return "Mở khóa tài khoản";
    case "LOCK_COMPANY":
      return "Khóa doanh nghiệp";
    case "UNLOCK_COMPANY":
      return "Mở khóa doanh nghiệp";
    case "APPROVE_COMPANY":
      return "Duyệt doanh nghiệp";
    case "REJECT_COMPANY":
      return "Từ chối doanh nghiệp";
    case "APPROVE_JOB":
      return "Duyệt tin tuyển dụng";
    case "REJECT_JOB":
      return "Từ chối tin tuyển dụng";
    case "DELETE_JOB":
      return "Xóa tin tuyển dụng";
    case "CREATE_JOB_CATEGORY":
      return "Thêm mới ngành nghề";
    case "UPDATE_JOB_CATEGORY":
      return "Cập nhật ngành nghề";
    case "DELETE_JOB_CATEGORY":
      return "Xóa ngành nghề";
    case "LOGIN_FAILED":
      return "Đăng nhập thất bại";
    case "UPDATE_APPLICATION_STATUS":
      return "Cập nhật trạng thái ứng tuyển";
    default:
      if (act.startsWith("CREATE_")) return "Thêm mới";
      if (act.startsWith("UPDATE_")) return "Cập nhật";
      if (act.startsWith("DELETE_")) return "Xóa";
      return act.replace(/_/g, " ").toLowerCase();
  }
}

export function formatTargetTypeName(
  targetType: string | null,
  targetLabel?: string | null
): string {
  if (targetLabel && targetLabel.trim()) {
    return targetLabel;
  }

  const type = String(targetType || "").toUpperCase();
  switch (type) {
    case "USER":
      return "Tài khoản người dùng";
    case "COMPANY":
      return "Doanh nghiệp";
    case "JOB":
      return "Tin tuyển dụng";
    case "JOB_CATEGORY":
      return "Ngành nghề";
    case "SYSTEM":
      return "Cấu hình hệ thống";
    case "NOTIFICATION":
      return "Thông báo";
    case "PERMISSION":
      return "Phân quyền";
    default:
      return targetType ? targetType : "Hệ thống";
  }
}

export function formatLogDateTime(dateString?: string | Date | null): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);

    const pad = (n: number) => String(n).padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(dateString);
  }
}

export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "AD";
}

export function getUserDisplayName(log: SystemLogItem): {
  primary: string;
  secondary: string;
  initials: string;
} {
  if (log.user) {
    const fullName = log.user.fullName || "Admin";
    const email = log.user.email ? `(${log.user.email})` : "";
    return {
      primary: fullName,
      secondary: email,
      initials: getUserInitials(log.user.fullName, log.user.email),
    };
  }

  return {
    primary: "Admin",
    secondary: "(admin)",
    initials: "AD",
  };
}
