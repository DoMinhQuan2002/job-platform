"use client";

/* eslint-disable @next/next/no-img-element -- avatar URL is supplied by the API at runtime */

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Link2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getStoredUser, setStoredUser } from "@/lib/auth-token";
import { cn } from "@/lib/utils";
import { candidateApi } from "@/modules/candidate/api";
import { CandidateWorkspaceLayout } from "@/modules/candidate/components";
import type { AccountUser, CandidateProfile } from "@/modules/candidate/types";
import { locationsApi } from "@/modules/locations/api";
import type { Province, Ward } from "@/modules/locations/types";

type Tab = "profile" | "security";
type AccountForm = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  provinceCode: string;
  wardCode: string;
  addressDetail: string;
  bio: string;
};
const tabs: Array<{ id: Tab; label: string }> = [
  { id: "profile", label: "Thông tin cá nhân" },
  { id: "security", label: "Bảo mật" },
];
const fieldClass =
  "h-11 w-full rounded-lg border border-[#c9ceda] bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-muted";

export default function AccountSettingPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [account, setAccount] = useState<AccountUser | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [form, setForm] = useState<AccountForm>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    provinceCode: "",
    wardCode: "",
    addressDetail: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([candidateApi.getAccountMe(), candidateApi.getMe()])
      .then(([a, p]) => {
        if (!active) return;
        setAccount(a.data);
        setProfile(p.data);
        setForm({
          fullName: a.data.fullName,
          email: a.data.email,
          phone: a.data.phone ?? "",
          dateOfBirth: a.data.dateOfBirth ?? "",
          provinceCode: "",
          wardCode: a.data.wardCode ?? "",
          addressDetail: a.data.addressDetail ?? "",
          bio: p.data.bio ?? "",
        });
      })
      .catch(
        (reason: unknown) =>
          active &&
          setError(
            reason instanceof Error
              ? reason.message
              : "Không thể tải cài đặt tài khoản.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const syncAccount = (user: AccountUser) => {
    setAccount(user);
    const stored = getStoredUser();
    setStoredUser({
      ...stored,
      email: user.email,
      fullName: user.fullName,
      role: stored?.role ?? "CANDIDATE",
    });
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = form.fullName.trim();
    const phone = form.phone.replace(/\s/g, "");
    if (fullName.length < 2)
      return setError("Họ và tên phải có ít nhất 2 ký tự.");
    if (phone && !/^(0|\+84)[0-9]{9}$/.test(phone))
      return setError("Số điện thoại không đúng định dạng.");
    if (form.provinceCode && !form.wardCode)
      return setError("Vui lòng chọn phường/xã.");
    setSaving(true);
    setError("");
    try {
      const [a, p] = await Promise.all([
        candidateApi.updateAccountMe({
          fullName,
          phone: phone || null,
          dateOfBirth: form.dateOfBirth || null,
          wardCode: form.wardCode || null,
          addressDetail: form.addressDetail.trim() || null,
        }),
        candidateApi.updateMe({ bio: form.bio.trim() || null }),
      ]);
      syncAccount(a.data);
      setProfile(p.data);
      setForm((v) => ({
        ...v,
        fullName: a.data.fullName,
        phone: a.data.phone ?? "",
        wardCode: a.data.wardCode ?? "",
        addressDetail: a.data.addressDetail ?? "",
        bio: p.data.bio ?? "",
      }));
      toast.success("Đã lưu thay đổi tài khoản");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể lưu thay đổi.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <CandidateWorkspaceLayout>
        <div className="skeleton h-[680px] rounded-xl" />
      </CandidateWorkspaceLayout>
    );
  if (!account || !profile)
    return (
      <CandidateWorkspaceLayout>
        <div className="rounded-xl border border-danger/20 bg-white p-8 text-center text-sm text-danger">
          {error || "Không tìm thấy tài khoản."}
        </div>
      </CandidateWorkspaceLayout>
    );
  return (
    <CandidateWorkspaceLayout
      sidebarProps={{
        profile,
        displayName: account.fullName,
        avatarUrl: account.avatar,
      }}
    >
      <header className="space-y-2">
        <nav className="flex items-center gap-1.5 text-[13px] text-muted">
          <Link href={ROUTES.home} className="hover:text-primary">
            Trang chủ
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground">
            Cài đặt tài khoản
          </span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-[#20242c]">
          Cài đặt tài khoản
        </h1>
        <p className="text-sm text-muted">
          Quản lý thông tin tài khoản và tùy chọn bảo mật.
        </p>
      </header>
      <div className="flex gap-8 overflow-x-auto border-b border-[#d7dbe5]">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setError("");
            }}
            className={cn(
              "shrink-0 border-b-2 px-0.5 pb-3 pt-2 text-sm font-medium",
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "profile" && (
        <ProfileTab
          account={account}
          form={form}
          setForm={setForm}
          saving={saving}
          error={error}
          onSubmit={saveProfile}
          onAccountChange={syncAccount}
        />
      )}
      {tab === "security" && <SecurityTab account={account} />}
    </CandidateWorkspaceLayout>
  );
}

function ProfileTab({
  account,
  form,
  setForm,
  saving,
  error,
  onSubmit,
  onAccountChange,
}: {
  account: AccountUser;
  form: AccountForm;
  setForm: Dispatch<SetStateAction<AccountForm>>;
  saving: boolean;
  error: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onAccountChange: (v: AccountUser) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [wardsLoading, setWardsLoading] = useState(false);
  const change = (key: keyof AccountForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    let active = true;
    Promise.all([
      locationsApi.listProvinces(),
      account.wardCode
        ? locationsApi.getWard(account.wardCode)
        : Promise.resolve(null),
    ])
      .then(([provinceResponse, wardResponse]) => {
        if (!active) return;
        setProvinces(provinceResponse.data);
        if (wardResponse) {
          setWardsLoading(true);
          setForm((current) => ({
            ...current,
            provinceCode: wardResponse.data.provinceCode,
          }));
        }
      })
      .catch((reason: unknown) => {
        if (active)
          toast.error(
            reason instanceof Error
              ? reason.message
              : "Không thể tải dữ liệu địa giới.",
          );
      })
      .finally(() => {
        if (active) setLocationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [account.wardCode, setForm]);
  useEffect(() => {
    if (!form.provinceCode) return;
    let active = true;
    locationsApi
      .listWards(form.provinceCode)
      .then((response) => {
        if (active) setWards(response.data);
      })
      .catch((reason: unknown) => {
        if (active)
          toast.error(
            reason instanceof Error
              ? reason.message
              : "Không thể tải danh sách phường/xã.",
          );
      })
      .finally(() => {
        if (active) setWardsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form.provinceCode]);
  const upload = async (file?: File) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    )
      return toast.error("Ảnh phải là JPG hoặc PNG và không vượt quá 2MB");
    setUploading(true);
    try {
      const r = await candidateApi.uploadAvatar(file);
      onAccountChange({ ...account, avatar: r.data.avatar });
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể cập nhật ảnh.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const remove = async () => {
    setUploading(true);
    try {
      await candidateApi.deleteAvatar();
      onAccountChange({ ...account, avatar: null });
      toast.success("Đã xóa ảnh đại diện");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể xóa ảnh.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_284px]">
      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-[#ccd1dc] bg-white p-6 shadow-sm sm:p-7"
      >
        <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
        <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Họ và tên" icon={<UserRound />}>
            <input
              className={fieldClass}
              value={form.fullName}
              onChange={(e) => change("fullName", e.target.value)}
              maxLength={100}
            />
          </Field>
          <Field label="Email" icon={<Mail />}>
            <input className={fieldClass} value={form.email} disabled />
          </Field>
          <Field label="Số điện thoại" icon={<Phone />}>
            <input
              className={fieldClass}
              value={form.phone}
              onChange={(e) => change("phone", e.target.value)}
              placeholder="0987 654 321"
            />
          </Field>
          <Field label="Ngày sinh" icon={<CalendarDays />}>
            <input
              className={fieldClass}
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.dateOfBirth}
              onChange={(e) => change("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field label="Tỉnh/Thành phố" icon={<MapPin />}>
            <select
              className={fieldClass}
              value={form.provinceCode}
              disabled={locationsLoading}
              onChange={(e) => {
                const provinceCode = e.target.value;
                setWards([]);
                setWardsLoading(Boolean(provinceCode));
                setForm((current) => ({
                  ...current,
                  provinceCode,
                  wardCode: "",
                }));
              }}
            >
              <option value="">
                {locationsLoading ? "Đang tải..." : "Chọn tỉnh/thành phố"}
              </option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.fullName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phường/Xã" icon={<MapPin />}>
            <select
              className={fieldClass}
              value={form.wardCode}
              disabled={!form.provinceCode || wardsLoading}
              onChange={(e) => change("wardCode", e.target.value)}
            >
              <option value="">
                {wardsLoading ? "Đang tải..." : "Chọn phường/xã"}
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.fullName}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Địa chỉ chi tiết"
            icon={<MapPin />}
            className="sm:col-span-2"
          >
            <input
              className={fieldClass}
              value={form.addressDetail}
              onChange={(e) => change("addressDetail", e.target.value)}
              maxLength={255}
              placeholder="Số nhà, tên đường, tòa nhà..."
            />
          </Field>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium">Giới thiệu bản thân</span>
            <textarea
              className="min-h-28 w-full resize-y rounded-lg border border-[#c9ceda] p-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={form.bio}
              onChange={(e) => change("bio", e.target.value)}
              maxLength={500}
            />
            <span className="block text-right text-xs text-muted">
              {form.bio.length}/500
            </span>
          </label>
        </div>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        <Button type="submit" className="mt-6 h-10 px-6" disabled={saving}>
          {saving ? (
            <>
              <LoaderCircle className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </form>
      <div className="space-y-5">
        <section className="rounded-xl border border-[#ccd1dc] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Ảnh đại diện</h2>
          <div className="mx-auto mt-7 flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#edf2f7] bg-slate-100">
            {account.avatar ? (
              <img
                src={account.avatar}
                alt={account.fullName}
                className="size-full object-cover"
              />
            ) : (
              <UserRound className="size-12 text-slate-400" />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-6 h-10 w-full border-primary text-primary"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
            Đổi ảnh
          </Button>
          {account.avatar && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => void remove()}
              className="mt-3 flex w-full items-center justify-center gap-2 text-xs font-medium text-danger"
            >
              <Trash2 className="size-3.5" />
              Xóa ảnh hiện tại
            </button>
          )}
          <p className="mt-3 text-center text-xs text-muted">
            JPG, PNG tối đa 2MB
          </p>
        </section>
      </div>
    </div>
  );
}

function SecurityTab({ account }: { account: AccountUser }) {
  const [v, setV] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (account.hasPassword === false) {
    return (
      <div className="max-w-2xl rounded-xl border border-[#ccd1dc] bg-white p-7 shadow-sm">
        <PanelHeading
          title="Bảo mật tài khoản"
          description="Quản lý phương thức đăng nhập và bảo mật của bạn."
        />
        <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-slate-50/70 p-5">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <span className="text-base font-bold text-[#4285f4]">G</span>
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[#20242c]">
                Tài khoản đăng nhập bằng Google
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Tài khoản của bạn (
                <span className="font-medium text-foreground">
                  {account.email}
                </span>
                ) được liên kết và bảo vệ an toàn thông qua Google.
              </p>
              <p className="pt-1 text-xs text-muted">
                Bạn không cần sử dụng mật khẩu riêng để đăng nhập vào hệ thống.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (v.newPassword !== v.confirmPassword)
      return setError("Mật khẩu xác nhận không khớp.");
    setSaving(true);
    setError("");
    try {
      await candidateApi.changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      setV({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Đổi mật khẩu thành công");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Không thể đổi mật khẩu.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="w-full rounded-xl border border-[#ccd1dc] bg-white p-7 shadow-sm"
    >
      <PanelHeading
        title="Đổi mật khẩu"
        description="Sử dụng mật khẩu mạnh và không dùng lại ở dịch vụ khác."
      />
      <div className="mt-6 space-y-5">
        <Password
          label="Mật khẩu hiện tại"
          value={v.currentPassword}
          onChange={(value) => setV({ ...v, currentPassword: value })}
        />
        <Password
          label="Mật khẩu mới"
          value={v.newPassword}
          onChange={(value) => setV({ ...v, newPassword: value })}
        />
        <Password
          label="Xác nhận mật khẩu mới"
          value={v.confirmPassword}
          onChange={(value) => setV({ ...v, confirmPassword: value })}
        />
      </div>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      <Button
        type="submit"
        className="mt-6"
        disabled={
          saving || !v.currentPassword || !v.newPassword || !v.confirmPassword
        }
      >
        {saving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </Button>
    </form>
  );
}

function Field({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("space-y-2", className)}>
      <span className="flex items-center gap-2 text-sm font-medium [&_svg]:size-4 [&_svg]:text-muted">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function PanelHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <ShieldCheck className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

function Password({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="size-4 text-muted" />
        {label}
      </span>
      <input
        className={fieldClass}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
