"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AdminUserDetail,
  adminUsersApi,
} from "@/services/admin-users.service";
import {
  ArrowLeft,
  Calendar,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Unlock,
  User as UserIcon,
} from "lucide-react";
import { LockUserModal } from "@/components/users/lock-user-modal";
import { UnlockUserModal } from "@/components/users/unlock-user-modal";
import { getAvatarUrl } from "@/lib/media";

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminUsersApi.getUserDetail(id);
      if (res && res.data) {
        setUser(res.data);
      } else {
        setError("Không tìm thấy thông tin người dùng");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin chi tiết người dùng. Vui lòng thử lại sau.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    adminUsersApi
      .getUserDetail(id)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.data) {
          setUser(res.data);
          setError(null);
        } else {
          setError("Không tìm thấy thông tin người dùng");
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin chi tiết người dùng. Vui lòng thử lại sau.";
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Lock Modal Handlers
  const handleOpenLockModal = () => {
    setModalError(null);
    setIsLockModalOpen(true);
  };

  const handleCloseLockModal = () => {
    if (isSubmitting) return;
    setIsLockModalOpen(false);
    setModalError(null);
  };

  const handleConfirmLock = async (reason: string) => {
    if (!user) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await adminUsersApi.updateUserStatus(user.id, {
        status: "BANNED",
        reason,
      });

      if (res?.success) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                status: "BANNED",
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setIsLockModalOpen(false);
        showToast("Đã khóa tài khoản thành công.", "success");
      } else {
        setModalError(res?.message || "Không thể khóa tài khoản. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi khóa tài khoản.";
      setModalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unlock Modal Handlers
  const handleOpenUnlockModal = () => {
    setModalError(null);
    setIsUnlockModalOpen(true);
  };

  const handleCloseUnlockModal = () => {
    if (isSubmitting) return;
    setIsUnlockModalOpen(false);
    setModalError(null);
  };

  const handleConfirmUnlock = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await adminUsersApi.updateUserStatus(user.id, {
        status: "ACTIVE",
      });

      if (res?.success) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                status: "ACTIVE",
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setIsUnlockModalOpen(false);
        showToast("Đã mở khóa tài khoản thành công.", "success");
      } else {
        setModalError(res?.message || "Không thể mở khóa tài khoản. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi mở khóa tài khoản.";
      setModalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Helpers
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa cập nhật";
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

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = (roleName?: string) => {
    switch (roleName?.toUpperCase()) {
      case "CANDIDATE":
        return "Ứng viên";
      case "RECRUITER":
        return "Nhà tuyển dụng";
      case "ADMIN":
        return "Quản trị viên";
      default:
        return roleName || "Người dùng";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        {/* Header skeleton */}
        <div className="bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-9 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="w-32 h-3 bg-slate-200 rounded" />
              <div className="w-48 h-6 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 h-8 bg-slate-200 rounded-full" />
            <div className="w-36 h-8 bg-slate-200 rounded-lg" />
          </div>
        </div>

        {/* Profile overview skeleton */}
        <div className="bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
          <div className="flex items-center gap-5 flex-1">
            <div className="size-24 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="w-56 h-7 bg-slate-200 rounded" />
              <div className="w-20 h-5 bg-slate-200 rounded" />
              <div className="w-72 h-4 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-px bg-[#C4C5D5] hidden lg:block" />
          <div className="flex-1 space-y-4">
            <div className="w-48 h-4 bg-slate-200 rounded" />
            <div className="w-64 h-4 bg-slate-200 rounded" />
          </div>
        </div>

        {/* 2 cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 p-6" />
          <div className="h-64 bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 p-6" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="size-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {error || "Không tìm thấy người dùng"}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Tài khoản không tồn tại hoặc bạn không có quyền truy cập thông tin này.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={fetchUser}
            className="px-4 py-2 bg-[#00288E] text-white rounded-lg text-sm font-medium hover:bg-[#00288E]/90 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const isBanned = user.status === "BANNED";
  const roleName = user.role?.name;
  const roleLabel = getRoleLabel(roleName);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Feedback Notification */}
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

      {/* 1. Header Card */}
      <div className="bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 p-5 lg:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="size-10 rounded-lg flex items-center justify-center hover:bg-white/80 active:bg-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Quay lại"
          >
            <ArrowLeft className="size-5 text-[#444653]" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#525463] font-medium mb-1">
              <Link
                href="/admin/users"
                className="hover:text-[#00288E] transition-colors"
              >
                Quản lý người dùng
              </Link>
              <span>&gt;</span>
              <span className="text-[#191C1E]">Chi tiết người dùng</span>
            </div>
            <h1 className="text-2xl lg:text-[26px] font-bold text-[#191C1E] tracking-tight">
              Chi tiết người dùng
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {isBanned ? (
            /* Locked Status Badge - Red Outline Pill with Lock Icon */
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border border-[#BA1A1A] text-[#BA1A1A] bg-[#FFF5F5]">
              <Lock className="size-3.5 text-[#BA1A1A]" />
              Tài khoản đang bị khóa
            </span>
          ) : (
            /* Active Status Badge - Green Filled Pill with Dot */
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
              <span className="size-2 rounded-full bg-[#10B981]" />
              Hoạt động
            </span>
          )}

          {/* Action Button: Khóa hoặc Mở khóa */}
          {isBanned ? (
            /* Unlock Button - Green Filled Pill/Button */
            <button
              type="button"
              onClick={handleOpenUnlockModal}
              className="rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] border border-[#A7F3D0]/60 transition-colors cursor-pointer shadow-xs"
            >
              <Unlock className="size-4 text-[#065F46]" />
              Mở khóa tài khoản
            </button>
          ) : (
            /* Lock Button - Red Outline Button */
            <button
              type="button"
              onClick={handleOpenLockModal}
              className="border border-[#BA1A1A] text-[#BA1A1A] hover:bg-red-50 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="size-4 text-[#BA1A1A]" />
              Khóa tài khoản
            </button>
          )}
        </div>
      </div>

      {/* 2. Profile Overview Card */}
      <div className="bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* User Basic Info */}
          <div className="flex items-center gap-5 min-w-0">
            {/* Avatar */}
            <div className="size-24 rounded-full border-4 border-[#F7F9FB] shadow-md overflow-hidden bg-[#1E40AF]/15 flex items-center justify-center shrink-0 ring-1 ring-slate-200">
              {getAvatarUrl(user.avatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAvatarUrl(user.avatar)!}
                  alt={user.fullName}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-[#00288E]">
                  {getInitials(user.fullName)}
                </span>
              )}
            </div>

            {/* Name, Role & Contact */}
            <div className="min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-[#191C1E] truncate">
                {user.fullName}
              </h2>

              <div className="mt-1">
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#1E40AF]/10 border border-[#00288E]/20 text-[#00288E]">
                  {roleLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-[#444653]">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="size-4 text-[#444653] shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="size-4 text-[#444653] shrink-0" />
                  <span>{user.phone || "Chưa cập nhật"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical separator */}
          <div className="hidden lg:block w-px self-stretch bg-[#C4C5D5] my-1" />

          {/* Right Info: Date of birth & Address */}
          <div className="w-full lg:w-[42%] space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#C4C5D5]/40">
            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-[#444653] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-[#525463]">Ngày sinh</div>
                <div className="text-sm font-medium text-[#191C1E] mt-0.5">
                  {formatDate(user.dateOfBirth)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-[#444653] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-[#525463]">Địa chỉ hiện tại</div>
                <div className="text-sm font-medium text-[#191C1E] mt-0.5 leading-relaxed">
                  {user.fullAddress ||
                    user.addressDetail ||
                    "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3.1 Card: Thông tin tài khoản */}
        <div className="bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 overflow-hidden shadow-sm flex flex-col">
          <div className="bg-white px-6 py-4 border-b border-[#C4C5D5] flex items-center gap-2.5">
            <UserIcon className="size-4 text-[#191C1E]" />
            <h3 className="text-base font-semibold text-[#191C1E]">
              Thông tin tài khoản
            </h3>
          </div>

          <div className="p-6 divide-y divide-[#E2E8F0] text-sm">
            <div className="flex items-center justify-between py-3.5 first:pt-0">
              <span className="text-[#525463]">Vai trò</span>
              <span className="font-medium text-[#191C1E]">{roleLabel}</span>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-[#525463]">Trạng thái</span>
              {isBanned ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[#BA1A1A] text-[#BA1A1A] bg-[#FFF5F5]">
                  <Lock className="size-3 text-[#BA1A1A]" />
                  Tài khoản đang bị khóa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">
                  <span className="size-1.5 rounded-full bg-[#10B981]" />
                  Hoạt động
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-[#525463]">Email đã xác minh</span>
              <span className="font-medium text-[#191C1E]">
                {user.emailVerifiedAt ? (
                  formatDateTime(user.emailVerifiedAt)
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded text-xs border border-amber-200">
                    Chưa xác minh
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-[#525463]">Lần đăng nhập gần nhất</span>
              <span className="font-medium text-[#191C1E]">
                {user.lastLoginAt ? (
                  formatDateTime(user.lastLoginAt)
                ) : (
                  <span className="text-slate-500 text-xs">
                    Chưa từng đăng nhập
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <span className="text-[#525463]">Ngày tạo tài khoản</span>
              <span className="font-medium text-[#191C1E]">
                {formatDateTime(user.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-3.5 last:pb-0">
              <span className="text-[#525463]">Ngày cập nhật gần nhất</span>
              <span className="font-medium text-[#191C1E]">
                {formatDateTime(user.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 3.2 Card: Thông tin địa chỉ */}
        <div className="bg-[#F7F9FB] rounded-xl border border-[#C4C5D5]/30 overflow-hidden shadow-sm flex flex-col">
          <div className="bg-white px-6 py-4 border-b border-[#C4C5D5] flex items-center gap-2.5">
            <MapPin className="size-4 text-[#191C1E]" />
            <h3 className="text-base font-semibold text-[#191C1E]">
              Thông tin địa chỉ
            </h3>
          </div>

          <div className="p-6 divide-y divide-[#E2E8F0] text-sm">
            <div className="flex items-start justify-between py-3.5 first:pt-0 gap-4">
              <span className="text-[#525463] shrink-0">Phường/Xã</span>
              <span className="font-medium text-[#191C1E] text-right">
                {user.wardName ||
                  (user.wardCode ? `Mã ${user.wardCode}` : "Chưa cập nhật")}
              </span>
            </div>

            <div className="flex items-start justify-between py-3.5 last:pb-0 gap-4">
              <span className="text-[#525463] shrink-0">Địa chỉ chi tiết</span>
              <span className="font-medium text-[#191C1E] text-right leading-relaxed max-w-[70%]">
                {user.fullAddress ||
                  user.addressDetail ||
                  "Chưa cập nhật"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Modal: Khóa tài khoản người dùng */}
      <LockUserModal
        isOpen={isLockModalOpen}
        onClose={handleCloseLockModal}
        onConfirm={handleConfirmLock}
        isLoading={isSubmitting}
        errorMessage={modalError}
      />

      {/* 5. Modal: Xác nhận mở khóa tài khoản */}
      <UnlockUserModal
        isOpen={isUnlockModalOpen}
        userName={user.fullName}
        onClose={handleCloseUnlockModal}
        onConfirm={handleConfirmUnlock}
        isLoading={isSubmitting}
        errorMessage={modalError}
      />
    </div>
  );
}
