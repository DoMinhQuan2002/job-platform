import {
  type LogActionType,
  type SystemLogItem,
} from "@/services/admin-system-logs.service";

export type TargetType =
  | "USER"
  | "COMPANY"
  | "JOB"
  | "JOB_CATEGORY"
  | "APPLICATION";

export const SYSTEM_LOG_ACTIONS: {
  key: LogActionType;
  label: string;
  targetType: TargetType;
  badgeClass: string;
}[] = [
  // Doanh nghiệp
  {
    key: "APPROVE_COMPANY",
    label: "Duyệt công ty",
    targetType: "COMPANY",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "REJECT_COMPANY",
    label: "Từ chối công ty",
    targetType: "COMPANY",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    key: "LOCK_COMPANY",
    label: "Khóa công ty",
    targetType: "COMPANY",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "UNLOCK_COMPANY",
    label: "Mở khóa công ty",
    targetType: "COMPANY",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },

  // Tin tuyển dụng
  {
    key: "APPROVE_JOB",
    label: "Duyệt tin tuyển dụng",
    targetType: "JOB",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "REJECT_JOB",
    label: "Từ chối tin tuyển dụng",
    targetType: "JOB",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    key: "DELETE_JOB",
    label: "Xóa tin tuyển dụng",
    targetType: "JOB",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },

  // Người dùng
  {
    key: "LOCK_USER",
    label: "Khóa tài khoản",
    targetType: "USER",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "UNLOCK_USER",
    label: "Mở khóa tài khoản",
    targetType: "USER",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    key: "LOGIN_FAILED",
    label: "Đăng nhập thất bại",
    targetType: "USER",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },

  // Ngành nghề
  {
    key: "CREATE_JOB_CATEGORY",
    label: "Thêm ngành nghề",
    targetType: "JOB_CATEGORY",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "UPDATE_JOB_CATEGORY",
    label: "Cập nhật ngành nghề",
    targetType: "JOB_CATEGORY",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    key: "DELETE_JOB_CATEGORY",
    label: "Xóa ngành nghề",
    targetType: "JOB_CATEGORY",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },

  // Ứng tuyển
  {
    key: "UPDATE_APPLICATION_STATUS",
    label: "Cập nhật trạng thái ứng tuyển",
    targetType: "APPLICATION",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export const SYSTEM_LOG_TARGET_TYPES: {
  key: TargetType;
  label: string;
}[] = [
  { key: "COMPANY", label: "Công ty" },
  { key: "JOB", label: "Tin tuyển dụng" },
  { key: "USER", label: "Người dùng" },
  { key: "JOB_CATEGORY", label: "Ngành nghề" },
  { key: "APPLICATION", label: "Hồ sơ ứng tuyển" },
];

export function getActionBadge(action: LogActionType): {
  label: string;
  badgeClass: string;
} {
  const item = SYSTEM_LOG_ACTIONS.find((a) => a.key === action);
  if (item) {
    return { label: item.label, badgeClass: item.badgeClass };
  }
  return {
    label: action,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

export function formatOperationName(action: LogActionType): string {
  const item = SYSTEM_LOG_ACTIONS.find((a) => a.key === action);
  if (item) return item.label;
  return action.replace(/_/g, " ").toLowerCase();
}

export function formatTargetTypeName(
  targetType: string | null,
  targetLabel?: string | null
): string {
  if (targetLabel && targetLabel.trim()) {
    return targetLabel;
  }

  const type = String(targetType || "").toUpperCase();
  const found = SYSTEM_LOG_TARGET_TYPES.find((t) => t.key === type);
  if (found) return found.label;

  return targetType ? targetType : "Hệ thống";
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
    primary: "Hệ thống",
    secondary: "",
    initials: "HT",
  };
}
