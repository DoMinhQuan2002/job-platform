"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRing, BriefcaseBusiness, Eye, EyeOff, LoaderCircle,
  LockKeyhole, Mail, UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { ADMIN_ROUTES } from "@/constants/routes";
import { authApi } from "@/services/auth.service";
import { clearAccessToken } from "@/lib/auth-token";
import { loginSchema, type LoginFormValues } from "./login.schema";

const features = [
  { icon: BriefcaseBusiness, title: "Việc làm đa dạng, chất lượng", description: "Cập nhật mỗi ngày từ hàng ngàn doanh nghiệp" },
  { icon: UserRound, title: "Hồ sơ nổi bật", description: "Tạo CV chuyên nghiệp và gây ấn tượng với nhà tuyển dụng" },
  { icon: BellRing, title: "Theo dõi dễ dàng", description: "Quản lý đơn ứng tuyển và nhận thông báo nhanh chóng" },
] as const;

const inputClassName =
  "h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 aria-invalid:border-danger aria-invalid:ring-danger/15";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: "", password: "", rememberMe: false },
    });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      const response = await authApi.login(
        { email: values.email.trim(), password: values.password },
        { remember: values.rememberMe },
      );

      const user = response.data.user;

      // Chỉ cho phép tài khoản có vai trò ADMIN truy cập
      if (user.role !== "ADMIN") {
        clearAccessToken();
        setSubmitError(
          "Tài khoản của bạn không có quyền truy cập vào cổng Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản Quản trị.",
        );
        return;
      }

      router.replace(ADMIN_ROUTES.dashboard);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể đăng nhập lúc này. Vui lòng thử lại.");
    }
  });

  return (
    <>
      <div className="h-full container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <section className="hidden flex-col pb-8 pt-8 lg:flex" aria-labelledby="login-introduction">
          <h1 id="login-introduction" className="mb-6 text-4xl font-bold leading-tight tracking-tight text-text xl:text-5xl">
            Kết nối đúng cơ hội,<br />bứt phá <span className="text-primary">sự nghiệp</span>
          </h1>
          <p className="mb-10 max-w-md leading-relaxed text-muted">
            Hàng ngàn việc làm từ các công ty uy tín đang chờ ứng viên như bạn.
          </p>
          <ul className="space-y-7">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div><h2 className="text-lg font-semibold text-text">{title}</h2><p className="mt-0.5 text-sm text-muted">{description}</p></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="justify-self-end w-full max-w-126 rounded-2xl border border-border/70 bg-white px-6 py-10 shadow-sm sm:px-12 sm:py-12" aria-labelledby="login-title">
          <header className="mb-8 text-center">
            <h1 id="login-title" className="text-3xl font-bold tracking-tight text-text">Đăng nhập</h1>
            <p className="mt-2 text-base text-muted">Giao diện đăng nhập trang admin</p>
          </header>


          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted"><Mail className="size-5" aria-hidden="true" /></span>
              <input id="email" type="email" autoComplete="email" placeholder="Nhập địa chỉ email" aria-invalid={Boolean(errors.email)} className={inputClassName} {...register("email")} />
            </Field>

            <Field label="Mật khẩu" htmlFor="password" error={errors.password?.message}>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted"><LockKeyhole className="size-5" aria-hidden="true" /></span>
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Nhập mật khẩu" aria-invalid={Boolean(errors.password)} className={`${inputClassName} pr-10`} {...register("password")} />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
              </button>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                <input type="checkbox" className="size-4 rounded border-slate-300 accent-primary" {...register("rememberMe")} />
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Button type="submit" size="lg" className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white shadow-none hover:bg-primary-hover" disabled={isSubmitting}>
              {isSubmitting ? <><LoaderCircle className="animate-spin" aria-hidden="true" />Đang đăng nhập...</> : "Đăng nhập"}
            </Button>
          </form>
        </section>
      </div>

      <AppAlertDialog
        open={Boolean(submitError)}
        onOpenChange={(open) => { if (!open) setSubmitError(""); }}
        tone="error"
        title="Đăng nhập thất bại"
        description={submitError}
        confirmLabel="Đóng"
        showCancel={false}
      />
    </>
  );
}

function LoginSkeleton() {
  return (
    <div
      className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12"
      aria-busy="true"
      aria-label="Đang tải trang đăng nhập"
    >
      <section className="hidden min-h-140 flex-col pb-8 pt-8 lg:flex" aria-hidden="true">
        <div className="skeleton h-140 w-full rounded-2xl" />
      </section>
      <section className="w-full max-w-126 justify-self-end" aria-hidden="true">
        <div className="skeleton h-140 w-full rounded-2xl" />
      </section>
    </div>
  );
}

type FieldProps = { label: string; htmlFor: string; error?: string; children: ReactNode };
function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-text">{label}</label>
      <div className="relative">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
