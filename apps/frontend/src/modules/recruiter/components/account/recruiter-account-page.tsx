"use client";

/* eslint-disable @next/next/no-img-element -- Avatar URL is dynamically provided from Supabase storage */

import {
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { getStoredUser, setStoredUser } from "@/lib/auth-token";
import { locationsApi } from "@/modules/locations/api";
import type { Province, Ward } from "@/modules/locations/types";
import {
  recruiterAccountApi,
  type RecruiterAccount,
} from "@/services/recruiter-account.service";

type Tab = "profile" | "security";

interface ProfileFormState {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  provinceCode: string;
  wardCode: string;
  addressDetail: string;
}

const initialForm: ProfileFormState = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  provinceCode: "",
  wardCode: "",
  addressDetail: "",
};

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-background disabled:text-muted";

export function RecruiterAccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [account, setAccount] = useState<RecruiterAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Profile form state
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const initialFormRef = useRef<ProfileFormState>(initialForm);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Locations state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [wardsLoading, setWardsLoading] = useState(false);

  // Avatar state
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Sync state to local storage for header/navbar avatar & name
  const syncAccount = (user: RecruiterAccount) => {
    setAccount(user);
    const stored = getStoredUser();
    if (stored) {
      setStoredUser({
        ...stored,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      });
    }
  };

  // Load account data
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    recruiterAccountApi
      .getMe(controller.signal)
      .then((response) => {
        const user = response.data;
        setAccount(user);
        const loadedForm: ProfileFormState = {
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
            : "",
          provinceCode: "",
          wardCode: user.wardCode || "",
          addressDetail: user.addressDetail || "",
        };
        initialFormRef.current = loadedForm;
        setForm(loadedForm);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Không thể tải thông tin cá nhân.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  // Load provinces and ward info
  useEffect(() => {
    let active = true;
    Promise.all([
      locationsApi.listProvinces(),
      account?.wardCode
        ? locationsApi.getWard(account.wardCode)
        : Promise.resolve(null),
    ])
      .then(([provinceRes, wardRes]) => {
        if (!active) return;
        setProvinces(provinceRes.data);
        if (wardRes) {
          setWardsLoading(true);
          const pCode = wardRes.data.provinceCode;
          initialFormRef.current = {
            ...initialFormRef.current,
            provinceCode: pCode,
          };
          setForm((prev) => ({
            ...prev,
            provinceCode: pCode,
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setProvincesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [account?.wardCode]);

  // Load wards when provinceCode changes
  useEffect(() => {
    if (!form.provinceCode) {
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
      .catch(() => {})
      .finally(() => {
        if (active) setWardsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.provinceCode]);

  // Check if profile form has changes
  const isProfileChanged =
    form.fullName !== initialFormRef.current.fullName ||
    form.phone !== initialFormRef.current.phone ||
    form.dateOfBirth !== initialFormRef.current.dateOfBirth ||
    form.provinceCode !== initialFormRef.current.provinceCode ||
    form.wardCode !== initialFormRef.current.wardCode ||
    form.addressDetail !== initialFormRef.current.addressDetail;

  // Handle Save Profile
  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullName = form.fullName.trim();
    const phone = form.phone.replace(/\s/g, "");

    if (fullName.length < 2) {
      setProfileError("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }
    if (phone && !/^(0|\+84)[0-9]{9}$/.test(phone)) {
      setProfileError("Số điện thoại không đúng định dạng (10 chữ số).");
      return;
    }
    if (form.provinceCode && !form.wardCode) {
      setProfileError("Vui lòng chọn phường/xã.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    try {
      const res = await recruiterAccountApi.updateMe({
        fullName,
        phone: phone || null,
        dateOfBirth: form.dateOfBirth || null,
        wardCode: form.wardCode || null,
        addressDetail: form.addressDetail.trim() || null,
      });

      syncAccount(res.data);
      initialFormRef.current = {
        ...form,
        fullName,
        phone,
        addressDetail: form.addressDetail.trim(),
      };
      toast.success("Cập nhật thông tin tài khoản thành công!");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật thông tin cá nhân.";
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Upload Avatar
  const handleUploadAvatar = async (file?: File) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      toast.error("Ảnh phải là định dạng JPG/PNG/WebP và dung lượng dưới 2MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await recruiterAccountApi.uploadAvatar(file);
      if (account) {
        syncAccount({ ...account, avatar: res.data.avatar });
      }
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể tải lên ảnh đại diện.",
      );
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Handle Delete Avatar
  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await recruiterAccountApi.deleteAvatar();
      if (account) {
        syncAccount({ ...account, avatar: null });
      }
      toast.success("Đã xóa ảnh đại diện.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa ảnh đại diện.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("Mật khẩu mới cần gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");

    try {
      await recruiterAccountApi.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Không thể đổi mật khẩu.";
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <AccountSkeleton />;

  if (error || !account) {
    return (
      <div className="grid min-h-[420px] w-full place-items-center">
        <div className="rounded-xl border border-danger/20 bg-surface p-8 text-center shadow-sm">
          <p className="text-sm text-danger">{error ?? "Không tìm thấy thông tin tài khoản."}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mx-auto mt-4 flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-hover"
          >
            <RefreshCw className="size-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const initials = account.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-xs text-muted">
          Quản lý thông tin tài khoản và bảo mật của nhà tuyển dụng.
        </p>
      </div>

      {/* Profile Overview Card */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border bg-primary/5 p-6 sm:flex sm:items-center sm:gap-5">
          <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary text-xl font-bold text-white shadow-sm">
            {account.avatar ? (
              <img
                src={account.avatar}
                alt={account.fullName}
                className="size-full object-cover"
              />
            ) : initials ? (
              <span>{initials}</span>
            ) : (
              <UserRound className="size-8 text-white" />
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-text">{account.fullName}</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Nhà tuyển dụng
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Mail className="size-3.5" />
              {account.email}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-6">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`cursor-pointer border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            Thông tin cá nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`cursor-pointer border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            Bảo mật & Mật khẩu
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
              {/* Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Họ và tên" icon={<User />} required>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      className={fieldClass}
                      placeholder="Nhập họ và tên"
                    />
                  </Field>

                  <Field label="Email đăng nhập" icon={<Mail />}>
                    <input
                      type="email"
                      disabled
                      value={form.email}
                      className={fieldClass}
                      title="Email dùng để đăng nhập hệ thống, không thể thay đổi"
                    />
                  </Field>

                  <Field label="Số điện thoại" icon={<Phone />}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className={fieldClass}
                      placeholder="Ví dụ: 0912345678"
                    />
                  </Field>

                  <Field label="Ngày sinh" icon={<CalendarDays />}>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Tỉnh / Thành phố" icon={<MapPin />}>
                    <select
                      className={`${fieldClass} cursor-pointer`}
                      value={form.provinceCode}
                      disabled={provincesLoading}
                      onChange={(e) => {
                        const nextProvince = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          provinceCode: nextProvince,
                          wardCode: "",
                        }));
                      }}
                    >
                      <option value="">
                        {provincesLoading
                          ? "Đang tải tỉnh/thành..."
                          : "Chọn tỉnh / thành phố"}
                      </option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Phường / Xã" icon={<MapPin />}>
                    <select
                      className={`${fieldClass} cursor-pointer`}
                      value={form.wardCode}
                      disabled={!form.provinceCode || wardsLoading}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, wardCode: e.target.value }))
                      }
                    >
                      <option value="">
                        {wardsLoading
                          ? "Đang tải phường/xã..."
                          : "Chọn phường / xã"}
                      </option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.fullName}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Địa chỉ chi tiết" icon={<MapPin />}>
                  <input
                    type="text"
                    value={form.addressDetail}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        addressDetail: e.target.value,
                      }))
                    }
                    className={fieldClass}
                    placeholder="Số nhà, tên đường, tòa nhà..."
                  />
                </Field>

                {profileError && (
                  <p className="text-xs font-medium text-danger">{profileError}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile || !isProfileChanged}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <LoaderCircle className="size-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Avatar Box */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background/50 p-5 text-center">
                <h3 className="text-xs font-bold text-text">Ảnh đại diện</h3>
                <div className="relative mx-auto my-4 flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary/10 shadow-sm">
                  {account.avatar ? (
                    <img
                      src={account.avatar}
                      alt={account.fullName}
                      className="size-full object-cover"
                    />
                  ) : initials ? (
                    <span className="text-2xl font-bold text-primary">
                      {initials}
                    </span>
                  ) : (
                    <UserRound className="size-10 text-muted" />
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleUploadAvatar(e.target.files?.[0])}
                />

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-primary bg-surface py-2 text-xs font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Đổi ảnh đại diện</span>
                  </button>

                  {account.avatar && (
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={handleDeleteAvatar}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-surface py-2 text-xs font-semibold text-muted transition hover:border-danger/30 hover:bg-danger/5 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Xóa ảnh</span>
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[10px] text-muted">
                  Hỗ trợ định dạng JPG, PNG hoặc WebP. Kích thước tối đa 2MB.
                </p>
              </div>
            </div>
          ) : (
            /* Security / Password Form */
            <div className="max-w-md space-y-5">
              {account.hasPassword === false ? (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-xs text-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-text">
                      Tài khoản liên kết Google
                    </p>
                    <p className="mt-1">
                      Tài khoản của bạn ({account.email}) được xác thực bảo mật
                      qua Google. Bạn không cần sử dụng mật khẩu riêng để đăng
                      nhập.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <PasswordField
                    label="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    onToggle={() => setShowCurrent((p) => !p)}
                    required
                  />

                  <PasswordField
                    label="Mật khẩu mới"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    onToggle={() => setShowNew((p) => !p)}
                    required
                  />

                  <PasswordField
                    label="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    onToggle={() => setShowConfirm((p) => !p)}
                    required
                  />

                  <div className="rounded-lg border border-border bg-background/50 p-3 text-[11px] text-muted">
                    <p className="font-medium text-text">Yêu cầu mật khẩu an toàn:</p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5 text-[10px]">
                      <li>Tối thiểu 8 ký tự</li>
                      <li>Bao gồm chữ hoa (A-Z) và chữ thường (a-z)</li>
                      <li>Bao gồm ít nhất một chữ số (0-9)</li>
                      <li>Bao gồm ít nhất một ký tự đặc biệt (@, #, $, %, ...)</li>
                    </ul>
                  </div>

                  {passwordError && (
                    <p className="text-xs font-medium text-danger">{passwordError}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={
                        savingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingPassword ? (
                        <>
                          <LoaderCircle className="size-3.5 animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="size-3.5" />
                          <span>Cập nhật mật khẩu</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  icon,
  required,
  children,
}: {
  label: string;
  icon: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
        <span className="text-primary [&_svg]:size-3.5">{icon}</span>
        {label}
        {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  required,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
        <Lock className="size-3.5 text-primary" />
        {label}
        {required && <span className="text-danger">*</span>}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} pr-9`}
          placeholder={`Nhập ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition hover:text-text"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </label>
  );
}

function AccountSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-6">
      <div className="h-6 w-44 rounded bg-border/60" />
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-5 border-b border-border p-6">
          <div className="size-20 rounded-full bg-border/60" />
          <div className="space-y-2">
            <div className="h-5 w-44 rounded bg-border/60" />
            <div className="h-4 w-28 rounded bg-border/40" />
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 rounded-lg bg-border/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
