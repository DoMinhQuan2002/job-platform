"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-error";
import {
  AdminUserItem,
  adminUsersApi,
  PaginationMeta,
  UserStatsSummary,
} from "@/services/admin-users.service";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Lock,
  LogIn,
  RefreshCw,
  Search,
  Unlock,
  X,
} from "lucide-react";
import { LockUserModal } from "@/components/users/lock-user-modal";
import { UnlockUserModal } from "@/components/users/unlock-user-modal";
import { getAvatarUrl } from "@/lib/media";

const getInitials = (name?: string) => {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarBg = (id: number) => {
  const colors = [
    "bg-[#00288E]",
    "bg-emerald-600",
    "bg-purple-600",
    "bg-orange-600",
    "bg-teal-600",
    "bg-indigo-600",
    "bg-blue-600",
  ];
  return colors[id % colors.length];
};

function UserAvatar({
  avatar,
  fullName,
  userId,
}: {
  avatar?: string | null;
  fullName?: string;
  userId: number;
}) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getAvatarUrl(avatar);

  if (avatarUrl && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={fullName || "Avatar"}
        onError={() => setImgError(true)}
        className="size-9 rounded-full object-cover shadow-xs shrink-0 border border-slate-200"
      />
    );
  }

  return (
    <div
      className={`grid size-9 place-items-center rounded-full text-xs font-bold text-white shadow-xs shrink-0 ${getAvatarBg(
        userId
      )}`}
    >
      {getInitials(fullName)}
    </div>
  );
}

export default function AdminUsersPage() {
  // Data States
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState<UserStatsSummary>({
    total: 0,
    active: 0,
    banned: 0,
    newIn30Days: 0,
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeFromDate, setActiveFromDate] = useState("");
  const [activeToDate, setActiveToDate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<
    "today" | "7days" | "30days" | "thisMonth" | null
  >(null);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Validate ngày đăng ký: Từ ngày <= Đến ngày
  const isDateRangeInvalid = !!(fromDate && toDate && fromDate > toDate);

  // Kiểm tra xem có option lọc nào đang được chọn hoặc có hiệu lực để làm sáng nút Lọc
  const hasSelectedFilters = Boolean(
    searchTerm.trim() ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    fromDate ||
    toDate ||
    activeSearch ||
    activeFromDate ||
    activeToDate
  );

  // UI States
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    isAuthError?: boolean;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Lock / Unlock Modal States
  const [selectedUserForStatus, setSelectedUserForStatus] =
    useState<AdminUserItem | null>(null);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenLockModal = (user: AdminUserItem) => {
    setSelectedUserForStatus(user);
    setStatusActionError(null);
    setIsLockModalOpen(true);
  };

  const handleOpenUnlockModal = (user: AdminUserItem) => {
    setSelectedUserForStatus(user);
    setStatusActionError(null);
    setIsUnlockModalOpen(true);
  };

  const handleConfirmLock = async (reason: string) => {
    if (!selectedUserForStatus) return;
    setStatusActionLoading(true);
    setStatusActionError(null);
    try {
      const res = await adminUsersApi.updateUserStatus(
        selectedUserForStatus.id,
        {
          status: "BANNED",
          reason,
        }
      );
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserForStatus.id
              ? { ...u, status: "BANNED" }
              : u
          )
        );
        setStats((prev) => ({
          ...prev,
          active: Math.max(0, prev.active - 1),
          banned: prev.banned + 1,
        }));
        setIsLockModalOpen(false);
        setSelectedUserForStatus(null);
        showToast("Đã khóa tài khoản thành công.", "success");
      } else {
        setStatusActionError(res?.message || "Không thể khóa tài khoản.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi khóa tài khoản.";
      setStatusActionError(message);
    } finally {
      setStatusActionLoading(false);
    }
  };

  const handleConfirmUnlock = async () => {
    if (!selectedUserForStatus) return;
    setStatusActionLoading(true);
    setStatusActionError(null);
    try {
      const res = await adminUsersApi.updateUserStatus(
        selectedUserForStatus.id,
        {
          status: "ACTIVE",
        }
      );
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserForStatus.id
              ? { ...u, status: "ACTIVE" }
              : u
          )
        );
        setStats((prev) => ({
          ...prev,
          active: prev.active + 1,
          banned: Math.max(0, prev.banned - 1),
        }));
        setIsUnlockModalOpen(false);
        setSelectedUserForStatus(null);
        showToast("Đã mở khóa tài khoản thành công.", "success");
      } else {
        setStatusActionError(res?.message || "Không thể mở khóa tài khoản.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi mở khóa tài khoản.";
      setStatusActionError(message);
    } finally {
      setStatusActionLoading(false);
    }
  };

  // Click outside listener for date picker popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDateOpen(false);
      }
    };
    if (isDateOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDateOpen]);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminUsersApi.getUsers({
        page: currentPage,
        limit: pageSize,
        search: activeSearch || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        fromDate: activeFromDate || undefined,
        toDate: activeToDate || undefined,
      });

      if (res?.success && res.data) {
        setUsers(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setError({
            message:
              "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại tài khoản quản trị.",
            isAuthError: true,
          });
        } else if (err.statusCode === 403) {
          setError({
            message:
              "Bạn không có quyền quản trị để truy cập trang quản lý người dùng.",
          });
        } else if (
          err.statusCode === 0 ||
          err.message.toLowerCase().includes("fetch")
        ) {
          setError({
            message:
              "Không thể kết nối đến hệ thống máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.",
          });
        } else {
          setError({
            message:
              err.message || "Đã xảy ra lỗi khi tải danh sách người dùng.",
          });
        }
      } else if (err instanceof Error) {
        if (err.message.toLowerCase().includes("fetch")) {
          setError({
            message:
              "Không thể kết nối đến hệ thống máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.",
          });
        } else {
          setError({
            message: err.message,
          });
        }
      } else {
        setError({
          message: "Đã xảy ra sự cố không xác định khi tải dữ liệu người dùng.",
        });
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    activeSearch,
    roleFilter,
    statusFilter,
    activeFromDate,
    activeToDate,
  ]);

  // Fetch Stats Summary
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminUsersApi.getUserStats();
      setStats(data);
    } catch {
      // Keep default zero stats
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  // Filter Handlers
  const handleApplyFilter = () => {
    if (isDateRangeInvalid) return;
    setCurrentPage(1);
    setActiveSearch(searchTerm);
    setActiveFromDate(fromDate);
    setActiveToDate(toDate);
    setIsDateOpen(false);
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setActiveSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setFromDate("");
    setToDate("");
    setActiveFromDate("");
    setActiveToDate("");
    setSelectedPreset(null);
    setIsDateOpen(false);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplyFilter();
    }
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const getDateRangeDisplay = () => {
    if (activeFromDate && activeToDate) {
      return `${formatDateLabel(activeFromDate)} - ${formatDateLabel(activeToDate)}`;
    }
    if (activeFromDate) {
      return `Từ ${formatDateLabel(activeFromDate)}`;
    }
    if (activeToDate) {
      return `Đến ${formatDateLabel(activeToDate)}`;
    }
    return "Chọn khoảng";
  };

  const handleQuickPreset = (
    preset: "today" | "7days" | "30days",
    days: number
  ) => {
    setSelectedPreset(preset);
    const end = new Date();
    const start = new Date();
    if (days > 0) {
      start.setDate(end.getDate() - days);
    }
    setFromDate(start.toISOString().split("T")[0]);
    setToDate(end.toISOString().split("T")[0]);
  };

  const handleThisMonthPreset = () => {
    setSelectedPreset("thisMonth");
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setFromDate(firstDay.toISOString().split("T")[0]);
    setToDate(now.toISOString().split("T")[0]);
  };

  // Row Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === users.length && users.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Format Helpers
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "--/--/----";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getRoleBadge = (roleName?: string) => {
    const role = roleName?.toUpperCase() || "";
    if (role === "RECRUITER") {
      return {
        label: "Nhà tuyển dụng",
        className: "bg-[#F3E8FF] text-[#7E22CE]",
      };
    }
    if (role === "ADMIN") {
      return {
        label: "Quản trị viên",
        className: "bg-[#FEF3C7] text-[#B45309]",
      };
    }
    return {
      label: "Ứng viên",
      className: "bg-[#D0E1FB] text-[#00288E]",
    };
  };

  // Stat Cards Calculations
  const totalUsers = stats.total || pagination.total;
  const activePercent =
    totalUsers > 0 ? ((stats.active / totalUsers) * 100).toFixed(1) : "0.0";
  const bannedPercent =
    totalUsers > 0 ? ((stats.banned / totalUsers) * 100).toFixed(1) : "0.0";
  const newPercent =
    totalUsers > 0
      ? ((stats.newIn30Days / totalUsers) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#191C1E]">
          Quản lý người dùng
        </h1>
        <nav
          aria-label="Breadcrumb"
          className="mt-1 flex items-center gap-1.5 text-xs text-[#444653]"
        >
          <span className="hover:text-[#00288E] transition-colors cursor-pointer">
            Dashboard
          </span>
          <span className="text-slate-400">&gt;</span>
          <span className="font-medium text-[#191C1E]">Quản lý người dùng</span>
        </nav>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng người dùng */}
        <div className="flex items-center gap-4 rounded-xl border border-[#E0E3E5] bg-white p-5 shadow-xs">
          <div className="grid size-12 place-items-center rounded-full bg-[#D0E1FB] text-[#00288E] shrink-0">
            <svg
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM18 16V13C18 12.2667 17.7958 11.5625 17.3875 10.8875C16.9792 10.2125 16.4 9.63333 15.65 9.15C16.5 9.25 17.3 9.42083 18.05 9.6625C18.8 9.90417 19.5 10.2 20.15 10.55C20.75 10.8833 21.2083 11.2542 21.525 11.6625C21.8417 12.0708 22 12.5167 22 13V16H18ZM8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM18 4C18 5.1 17.6083 6.04167 16.825 6.825C16.0417 7.60833 15.1 8 14 8C13.8167 8 13.5833 7.97917 13.3 7.9375C13.0167 7.89583 12.7833 7.85 12.6 7.8C13.05 7.26667 13.3958 6.675 13.6375 6.025C13.8792 5.375 14 4.7 14 4C14 3.3 13.8792 2.625 13.6375 1.975C13.3958 1.325 13.05 0.733333 12.6 0.2C12.8333 0.116667 13.0667 0.0625 13.3 0.0375C13.5333 0.0125 13.7667 0 14 0C15.1 0 16.0417 0.391667 16.825 1.175C17.6083 1.95833 18 2.9 18 4ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-[#444653]">Tổng người dùng</p>
            {statsLoading ? (
              <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#191C1E]">
                {totalUsers.toLocaleString()}
              </p>
            )}
            <p className="text-[11px] text-[#444653]">Tất cả tài khoản</p>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div className="flex items-center gap-4 rounded-xl border border-[#E0E3E5] bg-white p-5 shadow-xs">
          <div className="grid size-12 place-items-center rounded-full bg-[#D1FAE5] text-[#059669] shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-[#444653]">Đang hoạt động</p>
            {statsLoading ? (
              <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#191C1E]">
                {stats.active.toLocaleString()}
              </p>
            )}
            <p className="text-[11px] text-[#444653]">{activePercent}% tổng số</p>
          </div>
        </div>

        {/* Card 3: Đang bị khóa */}
        <div className="flex items-center gap-4 rounded-xl border border-[#E0E3E5] bg-white p-5 shadow-xs">
          <div className="grid size-12 place-items-center rounded-full bg-[#FEF3C7] text-[#D97706] shrink-0">
            <svg
              width="16"
              height="21"
              viewBox="0 0 16 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 21C1.45 21 0.979167 20.8042 0.5875 20.4125C0.195833 20.0208 0 19.55 0 19V9C0 8.45 0.195833 7.97917 0.5875 7.5875C0.979167 7.19583 1.45 7 2 7H3V5C3 3.61667 3.4875 2.4375 4.4625 1.4625C5.4375 0.4875 6.61667 0 8 0C9.38333 0 10.5625 0.4875 11.5375 1.4625C12.5125 2.4375 13 3.61667 13 5V7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V19C16 19.55 15.8042 20.0208 15.4125 20.4125C15.0208 20.8042 14.55 21 14 21H2ZM2 19H14V9H2V19ZM8 16C8.55 16 9.02083 15.8042 9.4125 15.4125C9.80417 15.0208 10 14.55 10 14C10 13.45 9.80417 12.9792 9.4125 12.5875C9.02083 12.1958 8.55 12 8 12C7.45 12 6.97917 12.1958 6.5875 12.5875C6.19583 12.9792 6 13.45 6 14C6 14.55 6.19583 15.0208 6.5875 15.4125C6.97917 15.8042 7.45 16 8 16ZM5 7H11V5C11 4.16667 10.7083 3.45833 10.125 2.875C9.54167 2.29167 8.83333 2 8 2C7.16667 2 6.45833 2.29167 5.875 2.875C5.29167 3.45833 5 4.16667 5 5V7ZM2 19V9V19Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-[#444653]">Đang bị khóa</p>
            {statsLoading ? (
              <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#191C1E]">
                {stats.banned.toLocaleString()}
              </p>
            )}
            <p className="text-[11px] text-[#444653]">{bannedPercent}% tổng số</p>
          </div>
        </div>

        {/* Card 4: Mới trong 30 ngày */}
        <div className="flex items-center gap-4 rounded-xl border border-[#E0E3E5] bg-white p-5 shadow-xs">
          <div className="grid size-12 place-items-center rounded-full bg-[#F3E8FF] text-[#9333EA] shrink-0">
            <svg
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 8V5H14V3H17V0H19V3H22V5H19V8H17ZM8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-[#444653]">Mới trong 30 ngày</p>
            {statsLoading ? (
              <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#191C1E]">
                {stats.newIn30Days.toLocaleString()}
              </p>
            )}
            <p className="text-[11px] text-[#444653]">{newPercent}% tổng số</p>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="rounded-xl border border-[#E0E3E5] bg-white shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="border-b border-[#E0E3E5] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              {/* Search Field */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#444653]">
                  Tìm kiếm
                </span>
                <div className="relative w-64 sm:w-72">
                  <Search className="absolute left-3.5 top-2.5 size-4 text-[#444653]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tìm kiếm theo tên, email..."
                    className="w-full rounded-lg border border-[#C4C5D5] bg-[#F7F9FB] py-2 pl-9 pr-3 text-xs text-[#191C1E] outline-none transition-colors placeholder:text-[#444653]/70 focus:border-[#00288E] focus:bg-white"
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#444653]">
                  Vai trò
                </span>
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none rounded-lg border border-[#C4C5D5] bg-[#F7F9FB] py-2 pl-3.5 pr-8 text-xs font-medium text-[#191C1E] outline-none transition-colors focus:border-[#00288E] focus:bg-white cursor-pointer"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="CANDIDATE">Ứng viên</option>
                    <option value="RECRUITER">Nhà tuyển dụng</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-[#444653]" />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#444653]">
                  Trạng thái
                </span>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none rounded-lg border border-[#C4C5D5] bg-[#F7F9FB] py-2 pl-3.5 pr-8 text-xs font-medium text-[#191C1E] outline-none transition-colors focus:border-[#00288E] focus:bg-white cursor-pointer"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="BANNED">Đang bị khóa</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-[#444653]" />
                </div>
              </div>

              {/* Register Date Dropdown with Range Popover */}
              <div className="relative flex flex-col gap-1.5" ref={datePickerRef}>
                <span className="text-xs font-semibold text-[#444653]">
                  Ngày đăng ký
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDateOpen((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-lg border py-2 px-3 text-xs font-medium cursor-pointer transition-colors ${
                      activeFromDate || activeToDate
                        ? "border-[#00288E] bg-[#EEF2FF] text-[#00288E]"
                        : "border-[#C4C5D5] bg-[#F7F9FB] text-[#191C1E] hover:bg-slate-100"
                    }`}
                  >
                    <Calendar className="size-3.5 shrink-0 text-current" />
                    <span>{getDateRangeDisplay()}</span>
                    {(activeFromDate || activeToDate) && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFromDate("");
                          setToDate("");
                          setActiveFromDate("");
                          setActiveToDate("");
                          setSelectedPreset(null);
                          setCurrentPage(1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setFromDate("");
                            setToDate("");
                            setActiveFromDate("");
                            setActiveToDate("");
                            setSelectedPreset(null);
                            setCurrentPage(1);
                          }
                        }}
                        className="ml-1 rounded-full p-0.5 hover:bg-blue-200 cursor-pointer"
                        title="Xóa khoảng ngày"
                      >
                        <X className="size-3" />
                      </span>
                    )}
                  </button>

                  {/* Popover */}
                  {isDateOpen && (
                    <div className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-xl border border-[#E0E3E5] bg-white p-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-[#191C1E]">
                          Chọn khoảng ngày đăng ký
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsDateOpen(false)}
                          className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="my-2.5 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickPreset("today", 0)}
                          className={`rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                            selectedPreset === "today"
                              ? "bg-[#00288E] text-white font-semibold shadow-xs"
                              : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
                          }`}
                        >
                          Hôm nay
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset("7days", 7)}
                          className={`rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                            selectedPreset === "7days"
                              ? "bg-[#00288E] text-white font-semibold shadow-xs"
                              : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
                          }`}
                        >
                          7 ngày qua
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPreset("30days", 30)}
                          className={`rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                            selectedPreset === "30days"
                              ? "bg-[#00288E] text-white font-semibold shadow-xs"
                              : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
                          }`}
                        >
                          30 ngày qua
                        </button>
                        <button
                          type="button"
                          onClick={handleThisMonthPreset}
                          className={`rounded-md px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                            selectedPreset === "thisMonth"
                              ? "bg-[#00288E] text-white font-semibold shadow-xs"
                              : "bg-slate-100 font-medium text-[#444653] hover:bg-[#EEF2FF] hover:text-[#00288E]"
                          }`}
                        >
                          Tháng này
                        </button>
                      </div>

                      {/* Custom Range Inputs */}
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-medium text-[#444653] mb-1">
                            Từ ngày
                          </label>
                          <input
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(e) => {
                              setFromDate(e.target.value);
                              setSelectedPreset(null);
                            }}
                            className={`w-full rounded-lg border bg-[#F7F9FB] px-2.5 py-1.5 text-xs text-[#191C1E] outline-none transition-colors cursor-pointer ${
                              isDateRangeInvalid
                                ? "border-red-400 focus:border-red-600 bg-red-50/20"
                                : "border-[#C4C5D5] focus:border-[#00288E] focus:bg-white"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#444653] mb-1">
                            Đến ngày
                          </label>
                          <input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(e) => {
                              setToDate(e.target.value);
                              setSelectedPreset(null);
                            }}
                            className={`w-full rounded-lg border bg-[#F7F9FB] px-2.5 py-1.5 text-xs text-[#191C1E] outline-none transition-colors cursor-pointer ${
                              isDateRangeInvalid
                                ? "border-red-400 focus:border-red-600 bg-red-50/20"
                                : "border-[#C4C5D5] focus:border-[#00288E] focus:bg-white"
                            }`}
                          />
                        </div>

                        {/* Inline Validation Alert */}
                        {isDateRangeInvalid && (
                          <div className="rounded-md bg-red-50 p-2 text-[11px] font-medium text-red-600 border border-red-200 flex items-center gap-1.5">
                            <AlertCircle className="size-3.5 shrink-0 text-red-600" />
                            <span>Từ ngày phải nhỏ hơn hoặc bằng Đến ngày</span>
                          </div>
                        )}
                      </div>

                      {/* Popover Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFromDate("");
                            setToDate("");
                            setSelectedPreset(null);
                          }}
                          className="text-[11px] font-medium text-[#444653] hover:text-[#00288E] cursor-pointer"
                        >
                          Xóa ngày
                        </button>
                        <button
                          type="button"
                          disabled={isDateRangeInvalid}
                          onClick={handleApplyFilter}
                          className={`rounded-md px-3.5 py-1.5 text-xs font-semibold text-white transition-colors ${
                            isDateRangeInvalid
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-[#00288E] hover:bg-[#002175] cursor-pointer"
                          }`}
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={handleApplyFilter}
                disabled={isDateRangeInvalid}
                className={`h-[38px] flex items-center gap-1.5 rounded-lg px-4 text-xs font-semibold transition-colors ${
                  hasSelectedFilters
                    ? "bg-[#D0E1FB] text-[#00288E] hover:bg-[#c2d7f8] cursor-pointer"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-500 cursor-pointer"
                }`}
              >
                <Filter className="size-3.5" />
                <span>Lọc</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                disabled={!hasSelectedFilters}
                className={`h-[38px] flex items-center rounded-lg px-3 text-xs font-medium transition-colors ${
                  hasSelectedFilters
                    ? "text-[#444653] hover:text-[#00288E] cursor-pointer"
                    : "text-slate-300 cursor-not-allowed opacity-50"
                }`}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="m-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span className="font-medium">{error.message}</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {error.isAuthError ? (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#00288E] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#002175] transition-colors"
                >
                  <LogIn className="size-3.5" />
                  <span>Đăng nhập lại</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => fetchUsers()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Thử lại</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] text-[#444653] border-b border-[#E0E3E5]">
              <tr>
                <th className="w-12 px-5 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={
                      users.length > 0 && selectedIds.length === users.length
                    }
                    onChange={handleSelectAll}
                    className="size-4 rounded border-slate-300 text-[#00288E] focus:ring-[#00288E] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 font-semibold">Người dùng</th>
                <th className="px-4 py-3.5 font-semibold">Vai trò</th>
                <th className="px-4 py-3.5 font-semibold">Email / SĐT</th>
                <th className="px-4 py-3.5 font-semibold">Trạng thái</th>
                <th className="px-4 py-3.5 font-semibold">Ngày đăng ký</th>
                <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3E5] text-[#191C1E]">
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4 text-center">
                      <div className="mx-auto size-4 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 rounded bg-slate-200" />
                          <div className="h-2.5 w-16 rounded bg-slate-200" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 rounded bg-slate-200" />
                        <div className="h-2.5 w-24 rounded bg-slate-200" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3.5 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <div className="size-4 rounded bg-slate-200" />
                        <div className="size-4 rounded bg-slate-200" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Không tìm thấy người dùng nào phù hợp</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleBadge = getRoleBadge(user.role?.name);
                  const isSelected = selectedIds.includes(user.id);
                  const isBanned = user.status === "BANNED";

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#F7F9FB] transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(user.id)}
                          className="size-4 rounded border-slate-300 text-[#00288E] focus:ring-[#00288E] cursor-pointer"
                        />
                      </td>

                      {/* User Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            avatar={user.avatar}
                            fullName={user.fullName}
                            userId={user.id}
                          />
                          <div>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-semibold text-[#191C1E] hover:text-[#00288E] transition-colors leading-tight block"
                            >
                              {user.fullName || "Chưa đặt tên"}
                            </Link>
                            <p className="text-[11px] text-[#444653]/70 font-mono mt-0.5">
                              ID: USR-{user.id.toString().padStart(5, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${roleBadge.className}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Email & Phone */}
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#191C1E]">{user.email}</p>
                        <p className="text-[11px] text-[#444653]/80 mt-0.5">
                          {user.phone || "Chưa cập nhật"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium leading-none ${
                            isBanned
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full shrink-0 ${
                              isBanned ? "bg-red-500" : "bg-emerald-500"
                            }`}
                          />
                          {isBanned ? "Đang bị khóa" : "Đang hoạt động"}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-4 text-[#444653]">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-[#444653]">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="rounded-md p-1 hover:bg-slate-100 hover:text-[#00288E] transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              isBanned
                                ? handleOpenUnlockModal(user)
                                : handleOpenLockModal(user)
                            }
                            className={`rounded-md p-1 transition-colors cursor-pointer ${
                              isBanned
                                ? "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                                : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                            }`}
                            title={isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {isBanned ? (
                              <Unlock className="size-4" />
                            ) : (
                              <Lock className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#E0E3E5] px-5 py-3.5 text-xs text-[#444653]">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-[#C4C5D5] bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-[#191C1E] outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1.5 size-3 text-[#444653]" />
            </div>
            <span>trên mỗi trang</span>
            {pagination.total > 0 && (
              <span className="ml-2 text-slate-400">
                (Tổng số: {pagination.total} người dùng)
              </span>
            )}
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="grid size-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              aria-label="Trang trước"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Render Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
              (_, index) => {
                const pageNum = index + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`grid size-7 place-items-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#00288E] text-white"
                        : "text-[#444653] hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            {pagination.totalPages > 5 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  className={`grid size-7 place-items-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    pagination.totalPages === currentPage
                      ? "bg-[#00288E] text-white font-semibold"
                      : "text-[#444653] hover:bg-slate-100"
                  }`}
                >
                  {pagination.totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= pagination.totalPages || loading}
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              className="grid size-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              aria-label="Trang sau"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lock User Modal */}
      <LockUserModal
        isOpen={isLockModalOpen}
        onClose={() => {
          setIsLockModalOpen(false);
          setSelectedUserForStatus(null);
        }}
        onConfirm={handleConfirmLock}
        isLoading={statusActionLoading}
        errorMessage={statusActionError}
      />

      {/* Unlock User Modal */}
      <UnlockUserModal
        isOpen={isUnlockModalOpen}
        userName={selectedUserForStatus?.fullName || "người dùng"}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setSelectedUserForStatus(null);
        }}
        onConfirm={handleConfirmUnlock}
        isLoading={statusActionLoading}
        errorMessage={statusActionError}
      />
    </div>
  );
}
