"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  BellRing,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/services/auth.service";
import { loginSchema, type LoginFormValues } from "./login.schema";

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Việc làm đa dạng, chất lượng",
    description: "Cập nhật mỗi ngày từ hàng ngàn doanh nghiệp",
  },
  {
    icon: UserRound,
    title: "Hồ sơ nổi bật",
    description: "Tạo CV chuyên nghiệp và gây ấn tượng với nhà tuyển dụng",
  },
  {
    icon: BellRing,
    title: "Theo dõi dễ dàng",
    description: "Quản lý đơn ứng tuyển và nhận thông báo nhanh chóng",
  },
] as const;




const inputClassName =
  "h-12 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger aria-invalid:ring-danger/15";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");

    try {
      const response = await authApi.login(
        {
          email: values.email.trim(),
          password: values.password,
        },
        { remember: values.rememberMe },
      );

      const role = response.data.user.role;
      router.replace(
        role === "CANDIDATE"
          ? ROUTES.candidate.root
          : role === "RECRUITER"
            ? ROUTES.recruiter.root
            : ROUTES.home,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể đăng nhập lúc này. Vui lòng thử lại.",
      );
    }
  });

  return (
    <>
      <div className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-0 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <section
          className="hidden flex-col pb-8 pt-8 lg:flex"
          aria-labelledby="login-introduction"
        >
          <h1
            id="login-introduction"
            className="mb-6 text-4xl font-bold leading-tight tracking-tight text-text xl:text-5xl"
          >
            Kết nối đúng cơ hội,
            <br />
            bứt phá <span className="text-primary">sự nghiệp</span>
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
                <div>
                  <h2 className="text-lg font-semibold text-text">{title}</h2>
                  <p className="mt-0.5 text-sm text-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="mx-auto w-full max-w-lg rounded-2xl border border-border/70 bg-white p-6 shadow-sm md:p-10 lg:p-12"
          aria-labelledby="login-title"
        >
          <h1 id="login-title" className="text-2xl font-bold text-text">
            Đăng nhập
          </h1>
          <p className="mb-8 mt-2 text-sm text-muted">
            Chào mừng bạn quay trở lại!
          </p>

          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <Mail className="size-5" aria-hidden="true" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ email"
                aria-invalid={Boolean(errors.email)}
                className={inputClassName}
                {...register("email")}
              />
            </Field>

            <Field
              label="Mật khẩu"
              htmlFor="password"
              error={errors.password?.message}
            >
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                aria-invalid={Boolean(errors.password)}
                className={`${inputClassName} pr-10`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-primary"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...register("rememberMe")}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link
                href={ROUTES.auth.forgotPassword}
                className="text-sm font-medium text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full bg-primary text-base text-white hover:bg-primary-hover"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Chưa có tài khoản?{" "}
            <Link
              href={ROUTES.auth.register}
              className="font-medium text-primary hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </section>
      </div>

      <AlertDialog
        open={Boolean(submitError)}
        onOpenChange={(open) => {
          if (!open) setSubmitError("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-danger/10 text-danger">
              <AlertCircle aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Đăng nhập thất bại</AlertDialogTitle>
            <AlertDialogDescription>{submitError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full sm:w-auto">
              Đóng
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-text"
      >
        {label}
      </label>
      <div className="relative">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
