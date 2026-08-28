"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRing, BriefcaseBusiness, Eye, EyeOff, LoaderCircle,
  LockKeyhole, Mail, UserRound,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { ROUTES } from "@/constants/routes";
import { authApi, type AuthUser } from "@/services/auth.service";
import { loginSchema, type LoginFormValues } from "./login.schema";

type GoogleCredentialResponse = { credential?: string };
type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: {
    type: "standard"; theme: "outline"; size: "large"; text: "continue_with";
    shape: "rectangular"; logo_alignment: "left"; locale: "vi"; width: number;
  }) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

const features = [
  { icon: BriefcaseBusiness, title: "Việc làm đa dạng, chất lượng", description: "Cập nhật mỗi ngày từ hàng ngàn doanh nghiệp" },
  { icon: UserRound, title: "Hồ sơ nổi bật", description: "Tạo CV chuyên nghiệp và gây ấn tượng với nhà tuyển dụng" },
  { icon: BellRing, title: "Theo dõi dễ dàng", description: "Quản lý đơn ứng tuyển và nhận thông báo nhanh chóng" },
] as const;

const inputClassName =
  "h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 aria-invalid:border-danger aria-invalid:ring-danger/15";

const destinationFor = (user: AuthUser) =>
  user.role === "CANDIDATE" ? ROUTES.candidate.profile
    : user.role === "RECRUITER" ? ROUTES.recruiter.root : ROUTES.home;

export default function LoginPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
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

  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
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

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleIdentity = window.google?.accounts.id;
    const container = googleButtonRef.current;
    if (!googleScriptReady || !clientId || !googleIdentity || !container) return;

    let lastWidth = 0;
    const render = () => {
      const width = Math.floor(container.getBoundingClientRect().width);
      if (width <= 0 || width === lastWidth) return;
      lastWidth = width;
      container.replaceChildren();
      googleIdentity.initialize({ client_id: clientId, callback: handleGoogleCredential });
      googleIdentity.renderButton(container, {
        type: "standard", theme: "outline", size: "large", text: "continue_with",
        shape: "rectangular", logo_alignment: "left", locale: "vi", width,
      });
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, [googleScriptReady, handleGoogleCredential]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client?hl=vi" strategy="afterInteractive" onLoad={() => setGoogleScriptReady(true)} />

      <div className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-0 lg:grid-cols-2 lg:gap-16 lg:py-12">
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

        <section className="mx-auto w-full max-w-126 rounded-2xl border border-border/70 bg-white px-6 py-10 shadow-sm sm:px-12 sm:py-12" aria-labelledby="login-title">
          <header className="mb-8 text-center">
            <h1 id="login-title" className="text-3xl font-bold tracking-tight text-text">Đăng nhập</h1>
            <p className="mt-2 text-base text-muted">Chào mừng bạn quay trở lại!</p>
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
              <Link href={ROUTES.auth.forgotPassword} className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</Link>
            </div>

            <Button type="submit" size="lg" className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white shadow-none hover:bg-primary-hover" disabled={isSubmitting || isGoogleSubmitting}>
              {isSubmitting ? <><LoaderCircle className="animate-spin" aria-hidden="true" />Đang đăng nhập...</> : "Đăng nhập"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" /><span className="text-sm text-muted">hoặc</span><span className="h-px flex-1 bg-border" />
          </div>

          <div className="relative min-h-11 " aria-busy={isGoogleSubmitting}>
            {googleClientId ? (
              <div ref={googleButtonRef} />
            ) : (
              <button type="button" className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-text transition hover:bg-slate-50" onClick={() => setSubmitError("Chưa cấu hình Google OAuth. Hãy thêm NEXT_PUBLIC_GOOGLE_CLIENT_ID vào file môi trường.")}>
                <GoogleLogo />Tiếp tục với Google
              </button>
            )}
            {isGoogleSubmitting ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/90 text-sm font-medium text-text"><LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />Đang đăng nhập...</div>
            ) : null}
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Chưa có tài khoản?{" "}<Link href={ROUTES.auth.register} className="font-medium text-primary hover:underline">Đăng ký ngay</Link>
          </p>
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

// Logo Google
function GoogleLogo() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
    </svg>
  );
}
