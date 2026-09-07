"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { Button } from "@/components/ui/button";
import { ResultModal } from "@/components/ui/result-modal";
import { AvatarUploadModal } from "@/components/settings/avatar-upload-modal";
import { getAvatarUrl } from "@/lib/media";
import { setStoredUser, getStoredUser } from "@/lib/auth-token";
import { locationsApi } from "@/modules/locations/api";
import type { Province, Ward } from "@/modules/locations/types";
import {
  adminAccountApi,
  type AccountUser,
} from "@/services/admin-account.service";
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400";

const getInitials = (name?: string) => {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

type ProfileForm = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  provinceCode: string;
  wardCode: string;
  addressDetail: string;
};

export default function AdminSettingsPage() {
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    provinceCode: "",
    wardCode: "",
    addressDetail: "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [deleteAvatarOpen, setDeleteAvatarOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [wardsLoading, setWardsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    adminAccountApi
      .getMe()
      .then((res) => {
        if (!active) return;
        setAccount(res.data);
        setForm({
          fullName: res.data.fullName,
          phone: res.data.phone ?? "",
          dateOfBirth: res.data.dateOfBirth ?? "",
          provinceCode: "",
          wardCode: res.data.wardCode ?? "",
          addressDetail: res.data.addressDetail ?? "",
        });
      })
      .catch((reason: unknown) => {
        toast.error(
          reason instanceof Error ? reason.message : "Không thể tải thông tin tài khoản.",
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      locationsApi.listProvinces(),
      account?.wardCode ? locationsApi.getWard(account.wardCode) : Promise.resolve(null),
    ])
      .then(([provinceRes, wardRes]) => {
        if (!active) return;
        setProvinces(provinceRes.data);
        if (wardRes) {
          setForm((current) => ({ ...current, provinceCode: wardRes.data.provinceCode }));
        }
      })
      .catch(() => {
        // Bỏ qua — không chặn form nếu tải địa giới lỗi.
      })
      .finally(() => active && setLocationsLoading(false));
    return () => {
      active = false;
    };
  }, [account?.wardCode]);

  useEffect(() => {
    if (!form.provinceCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWards([]);
      return;
    }
    let active = true;
    setWardsLoading(true);
    locationsApi
      .listWards(form.provinceCode)
      .then((res) => {
        if (active) setWards(res.data);
      })
      .catch(() => {
        // Bỏ qua — chỉ ảnh hưởng danh sách gợi ý.
      })
      .finally(() => active && setWardsLoading(false));
    return () => {
      active = false;
    };
  }, [form.provinceCode]);

  const syncAccount = (next: AccountUser) => {
    setAccount(next);
    const stored = getStoredUser();
    setStoredUser({
      ...stored,
      email: next.email,
      fullName: next.fullName,
      role: stored?.role ?? "ADMIN",
      avatar: next.avatar,
    });
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = form.fullName.trim();
    if (fullName.length < 2) {
      toast.error("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }
    if (form.provinceCode && !form.wardCode) {
      toast.error("Vui lòng chọn phường/xã.");
      return;
    }
    setSaving(true);
    try {
      const res = await adminAccountApi.updateMe({
        fullName,
        phone: form.phone.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        addressDetail: form.addressDetail.trim() || null,
        wardCode: form.wardCode || null,
      });
      syncAccount(res.data);
      setSaveSuccessOpen(true);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Không thể lưu thông tin.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    setAvatarBusy(true);
    try {
      const res = await adminAccountApi.uploadAvatar(file);
      if (account) syncAccount({ ...account, avatar: res.data.avatar });
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Không thể cập nhật ảnh đại diện");
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarBusy(true);
    try {
      await adminAccountApi.deleteAvatar();
      if (account) syncAccount({ ...account, avatar: null });
      toast.success("Đã xóa ảnh đại diện");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Không thể xóa ảnh đại diện");
    } finally {
      setAvatarBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Cài đặt"
          breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Cài đặt" }]}
        />
        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-100 bg-white" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Cài đặt"
          breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Cài đặt" }]}
        />
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
          Không thể tải thông tin tài khoản.
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(account.avatar);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt"
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Cài đặt" }]}
      />
      <p className="-mt-4 text-sm text-slate-500">Quản lý thông tin tài khoản và bảo mật của bạn.</p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs sm:p-7"
        >
          <h2 className="text-lg font-bold text-slate-900">Thông tin tài khoản</h2>
          <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin cá nhân của bạn.</p>
          <div className="mt-5 border-t border-slate-100" />

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={account.fullName}
                className="size-20 rounded-full border-4 border-slate-50 object-cover shadow-sm"
              />
            ) : (
              <div className="grid size-20 place-items-center rounded-full bg-primary text-xl font-bold text-white shadow-sm">
                {getInitials(account.fullName)}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4"
                onClick={() => setAvatarModalOpen(true)}
              >
                <Upload className="size-4" />
                Đổi avatar
              </Button>
              {account.avatar && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-red-200 px-4 text-red-600 hover:bg-red-50"
                  disabled={avatarBusy}
                  onClick={() => setDeleteAvatarOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Xóa avatar
                </Button>
              )}
            </div>
            <p className="w-full text-xs text-slate-400 sm:w-auto">
              Dung lượng tối đa 2MB. Hỗ trợ định dạng: JPG, PNG.
            </p>
          </div>

          <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="Email">
              <input className={fieldClass} value={account.email} disabled />
              <span className="mt-1 block text-xs text-slate-400">Chỉ xem — không thể thay đổi email.</span>
            </Field>
            <Field label="Họ và tên" required>
              <input
                className={fieldClass}
                value={form.fullName}
                onChange={(e) => setForm((v) => ({ ...v, fullName: e.target.value }))}
                maxLength={100}
              />
            </Field>
            <Field label="Số điện thoại">
              <input
                className={fieldClass}
                value={form.phone}
                onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
                placeholder="0987 654 321"
              />
            </Field>
            <Field label="Ngày sinh">
              <input
                type="date"
                className={fieldClass}
                max={new Date().toISOString().slice(0, 10)}
                value={form.dateOfBirth}
                onChange={(e) => setForm((v) => ({ ...v, dateOfBirth: e.target.value }))}
              />
            </Field>
            <Field label="Địa chỉ chi tiết" className="sm:col-span-2">
              <input
                className={fieldClass}
                value={form.addressDetail}
                onChange={(e) => setForm((v) => ({ ...v, addressDetail: e.target.value }))}
                maxLength={255}
                placeholder="Số nhà, tên đường..."
              />
            </Field>
            <Field label="Tỉnh/Thành phố">
              <select
                className={fieldClass}
                value={form.provinceCode}
                disabled={locationsLoading}
                onChange={(e) =>
                  setForm((v) => ({ ...v, provinceCode: e.target.value, wardCode: "" }))
                }
              >
                <option value="">{locationsLoading ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.fullName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phường/Xã">
              <select
                className={fieldClass}
                value={form.wardCode}
                disabled={!form.provinceCode || wardsLoading}
                onChange={(e) => setForm((v) => ({ ...v, wardCode: e.target.value }))}
              >
                <option value="">{wardsLoading ? "Đang tải..." : "Chọn phường/xã"}</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.fullName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trạng thái tài khoản" className="sm:col-span-2">
              <div className="flex h-11 items-center rounded-lg bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
                Đang hoạt động
              </div>
            </Field>
          </div>

          <Button type="submit" className="mt-6 h-10 px-6" disabled={saving}>
            {saving ? <LoaderCircle className="animate-spin" /> : <Upload className="size-4" />}
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </Button>
        </form>

        <ChangePasswordCard />
      </div>

      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        onConfirm={handleUploadAvatar}
      />

      <ResultModal
        open={saveSuccessOpen}
        onOpenChange={setSaveSuccessOpen}
        tone="success"
        title="Đã lưu thông tin"
        description="Thông tin tài khoản của bạn đã được cập nhật thành công."
      />

      <AppAlertDialog
        open={deleteAvatarOpen}
        onOpenChange={setDeleteAvatarOpen}
        title="Xóa ảnh đại diện"
        description="Bạn có chắc muốn xóa ảnh đại diện hiện tại? Sau khi xóa, hệ thống sẽ hiển thị chữ cái đầu tên bạn thay thế."
        tone="error"
        confirmLabel="Xóa"
        onConfirm={handleDeleteAvatar}
      />
    </div>
  );
}

function ChangePasswordCard() {
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSaving(true);
    try {
      await adminAccountApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      formRef.current?.reset();
      toast.success("Đổi mật khẩu thành công");
    } catch (reason) {
      setFailureMessage(
        reason instanceof Error ? reason.message : "Không thể đổi mật khẩu.",
      );
      setFailureOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-xs sm:p-7"
    >
      <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
      <p className="mt-1 text-sm text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
      <div className="mt-5 border-t border-slate-100" />

      <div className="mt-6 space-y-5">
        <PasswordField
          label="Mật khẩu hiện tại"
          value={values.currentPassword}
          onChange={(v) => setValues((s) => ({ ...s, currentPassword: v }))}
          visible={showCurrent}
          onToggleVisible={() => setShowCurrent((s) => !s)}
        />
        <PasswordField
          label="Mật khẩu mới"
          value={values.newPassword}
          onChange={(v) => setValues((s) => ({ ...s, newPassword: v }))}
          visible={showNew}
          onToggleVisible={() => setShowNew((s) => !s)}
        />
        <PasswordField
          label="Xác nhận mật khẩu mới"
          value={values.confirmPassword}
          onChange={(v) => setValues((s) => ({ ...s, confirmPassword: v }))}
          visible={showConfirm}
          onToggleVisible={() => setShowConfirm((s) => !s)}
        />
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-blue-50 p-3.5 text-xs text-blue-800">
        <KeyRound className="mt-0.5 size-3.5 shrink-0" />
        <span>
          Mật khẩu mới phải từ 8-72 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
        </span>
      </div>

      <Button
        type="submit"
        className="mt-6 h-10 w-full px-5"
        disabled={
          saving || !values.currentPassword || !values.newPassword || !values.confirmPassword
        }
      >
        {saving ? <LoaderCircle className="animate-spin" /> : <KeyRound className="size-4" />}
        {saving ? "Đang cập nhật..." : "Đổi mật khẩu"}
      </Button>

      <ResultModal
        open={failureOpen}
        onOpenChange={setFailureOpen}
        tone="error"
        title="Đổi mật khẩu thất bại"
        description={failureMessage}
      />
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cnField(className)}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function cnField(className?: string) {
  return ["block", className].filter(Boolean).join(" ");
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
        <span className="ml-0.5 text-red-500">*</span>
      </span>
      <div className="relative mt-1.5">
        <input
          type={visible ? "text" : "password"}
          className={`${fieldClass} pr-10`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </label>
  );
}
