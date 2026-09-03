/** 11 giá trị type — xem docs/api-contract/group4/notifications.md */
export type NotificationType =
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_UNLOCKED"
  | "COMPANY_LOCKED"
  | "COMPANY_UNLOCKED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "JOB_APPROVED"
  | "JOB_REJECTED"
  | "JOB_DELETED"
  | "NEW_APPLICATION"
  | "APPLICATION_STATUS_CHANGED";

export type NotificationTargetType = "USER" | "COMPANY" | "JOB" | "APPLICATION";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  targetType: NotificationTargetType | null;
  targetId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

/** Chỉ có khi type = APPLICATION_STATUS_CHANGED và application còn tồn tại */
export type NotificationJobInfo = {
  id: string;
  title: string;
  slug: string;
  address: string;
  jobType: string;
  jobMode: string;
  salaryMin: string | null;
  salaryMax: string | null;
  isNegotiable: boolean;
  company: { id: string; name: string; logo: string | null };
  applicationId: string;
  applicationStatus: string;
};

export type NotificationDetail = NotificationItem & { job: NotificationJobInfo | null };

export type PaginatedNotifications = {
  items: NotificationItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type NotificationListQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  /** 1 hoặc nhiều type — FE tự gộp nhóm tab, BE không định nghĩa nhóm cứng */
  type?: NotificationType[];
  from?: string;
  to?: string;
};
