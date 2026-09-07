"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRing, BriefcaseBusiness, Eye, EyeOff, LoaderCircle,
  LockKeyhole, Mail, UserRound,
} from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { ROUTES } from "@/constants/routes";
import { authApi, type AuthUser } from "@/services/auth.service";
import { loginSchema, type LoginFormValues } from "./login.schema";

const features = [
  { icon: BriefcaseBusiness, title: "Việc làm đa dạng, chất lượng", description: "Cập nhật mỗi ngày từ hàng ngàn doanh nghiệp" },
  { icon: UserRound, title: "Hồ sơ nổi bật", description: "Tạo CV chuyên nghiệp và gây ấn tượng với nhà tuyển dụng" },
  { icon: BellRing, title: "Theo dõi dễ dàng", description: "Quản lý đơn ứng tuyển và nhận thông báo nhanh chóng" },
] as const;

export const inputClassName =
  "h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 aria-invalid:border-danger aria-invalid:ring-danger/15";

const destinationFor = (user: AuthUser) =>
  user.role === "CANDIDATE" ? ROUTES.candidate.profile
    : user.role === "RECRUITER" ? ROUTES.recruiter.root : ROUTES.home;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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
      router.replace(destinationFor(response.data.user));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể đăng nhập lúc này. Vui lòng thử lại.");
    }
  });

  const handleGoogleCredential = useCallback(async (response: CredentialResponse) => {
    if (!response.credential) {
      setSubmitError("Google không trả về thông tin đăng nhập. Vui lòng thử lại.");
      return;
    }
    setSubmitError("");
    setIsGoogleSubmitting(true);
    try {
      const result = await authApi.loginWithGoogle({
        idToken: response.credential,
        role: "CANDIDATE",
      });
      router.replace(destinationFor(result.data.user));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể đăng nhập bằng Google. Vui lòng thử lại.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  }, [router]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <>
      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="container mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <section className="hidden flex-col justify-center pb-8 pt-8 lg:flex" aria-labelledby="login-introduction">
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

          <section className="w-full max-w-126 justify-self-center lg:justify-self-end rounded-2xl border border-border/70 bg-white px-6 py-10 shadow-sm sm:px-12 sm:py-12" aria-labelledby="login-title">
          <header className="mb-8 text-center">
            <h1 id="login-title" className="text-3xl font-bold tracking-tight text-text">Đăng nhập</h1>
            <p className="mt-2 text-base text-muted">Chào mừng bạn quay trở lại!</p>
          </header>

          <div className="min-h-12" aria-busy={isGoogleSubmitting}>
            {isGoogleSubmitting ? (
              <div
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-medium text-text shadow-xs"
                role="status"
                aria-live="polite"
              >
                <LoaderCircle className="mr-2 size-4 animate-spin text-primary" aria-hidden="true" />
                Đang đăng nhập bằng Google...
              </div>
            ) : googleClientId ? (
              <div className="relative h-12 w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs transition hover:border-slate-400 hover:bg-slate-50">
                {/* Visual Custom Google Button: 100% full width, đẹp mắt, đồng bộ với thiết kế */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 px-4 text-sm font-medium text-text">
                  <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Tiếp tục với Google</span>
                </div>

                {/* GoogleLogin Overlay: Kích thước được phóng to bao phủ toàn bộ nút, độ trong suốt = 0 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 cursor-pointer [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full">
                  <GoogleLogin
                    onSuccess={handleGoogleCredential}
                    onError={() => {
                      setIsGoogleSubmitting(false);
                      setSubmitError("Không thể mở đăng nhập Google. Vui lòng thử lại.");
                    }}
                    type="standard"
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="400"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-medium text-text shadow-xs hover:border-slate-400 hover:bg-slate-50"
                onClick={() => setSubmitError("Chưa cấu hình Google OAuth. Hãy thêm NEXT_PUBLIC_GOOGLE_CLIENT_ID vào file môi trường.")}
              >
                Tiếp tục với Google
              </button>
            )}
          </div>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" /><span className="text-sm text-muted">hoặc</span><span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted"><Mail className="size-5" aria-hidden="true" /></span>
              <input maxLength={254} id="email" type="email" autoComplete="email" placeholder="Nhập địa chỉ email" aria-invalid={Boolean(errors.email)} className={inputClassName} {...register("email")} />
            </Field>

            <Field label="Mật khẩu" htmlFor="password" error={errors.password?.message}>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted"><LockKeyhole className="size-5" aria-hidden="true" /></span>
              <input maxLength={64} id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Nhập mật khẩu" aria-invalid={Boolean(errors.password)} className={`${inputClassName} pr-10`} {...register("password")} />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
              </button>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                <input type="checkbox" className="size-4 rounded border-slate-300 accent-primary" {...register("rememberMe")} />
                Ghi nhớ đăng nhập
              </label>
              <Link href={ROUTES.auth.forgotPassword} className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</Link>
            </div>

            <Button type="submit" size="lg" className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white shadow-none hover:bg-primary-hover" disabled={isSubmitting || isGoogleSubmitting}>
              {isSubmitting ? <><LoaderCircle className="animate-spin" aria-hidden="true" />Đang đăng nhập...</> : "Đăng nhập"}
            </Button>
          </form>


          <p className="mt-8 text-center text-sm text-muted">
            Chưa có tài khoản?{" "}<Link href={ROUTES.auth.register} className="font-medium text-primary hover:underline">Đăng ký ngay</Link>
          </p>
        </section>
      </div>
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

export function LoginSkeleton() {
  return (
    <div
      className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12"
      aria-busy="true"
      aria-label="Đang tải trang đăng nhập"
    >
      <section className="hidden min-h-[560px] flex-col pb-8 pt-8 lg:flex" aria-hidden="true">
        <div className="skeleton h-[560px] w-full rounded-2xl" />
      </section>
      <section className="w-full max-w-126 justify-self-end" aria-hidden="true">
        <div className="skeleton h-[560px] w-full rounded-2xl" />
      </section>
    </div>
  );
}

type FieldProps = { label: string; htmlFor: string; error?: string; children: ReactNode };
export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-text">{label}</label>
      <div className="relative">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
