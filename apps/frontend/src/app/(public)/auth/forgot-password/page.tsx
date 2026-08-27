"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { authApi } from "@/services/auth.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "./forgot-password.schema";

export default function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const response = await authApi.forgotPassword({
        email: values.email.trim(),
      });
      setSubmitSuccess(
        response.message ||
          "Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi.",
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể gửi mã OTP lúc này. Vui lòng thử lại.",
      );
    }
  });

  return (
    <div className="flex min-h-[calc(100dvh-160px)] items-center justify-center px-4 py-10 md:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] md:grid-cols-[0.8fr_1.2fr]">
        <section
          className="hidden min-h-[500px] items-center justify-center border-r border-border/50 bg-white p-10 md:flex"
          aria-label="Minh họa gửi email xác thực"
        >
          <div className="relative flex size-72 items-center justify-center rounded-full bg-slate-50">
            <span className="absolute left-8 top-12 text-2xl font-light text-primary/30">
              +
            </span>
            <span className="absolute bottom-10 right-8 text-2xl font-light text-primary/30">
              +
            </span>
            <div className="relative flex h-32 w-40 items-center justify-center rounded-lg bg-primary text-white shadow-xl shadow-primary/25">
              <Mail className="size-24 stroke-[1.25]" aria-hidden="true" />
              <Send
                className="absolute -right-10 -top-9 size-12 rotate-[-8deg] text-primary"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        <section
          className="flex min-h-[500px] flex-col justify-center p-6 sm:p-10 lg:p-16"
          aria-labelledby="forgot-password-title"
        >
          <span className="mb-5 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            BƯỚC 1/3
          </span>

          <h1
            id="forgot-password-title"
            className="text-3xl font-bold tracking-tight text-text"
          >
            Quên mật khẩu
          </h1>
          <p className="mb-7 mt-2 max-w-md text-sm leading-6 text-muted">
            Nhập email của bạn để chúng tôi gửi mã OTP đặt lại mật khẩu.
          </p>

          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-text"
              >
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Mail className="size-5" aria-hidden="true" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Nhập email của bạn"
                  aria-invalid={Boolean(errors.email)}
                  className="h-12 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger aria-invalid:ring-danger/15"
                  {...register("email")}
                />
              </div>
              {errors.email?.message ? (
                <p className="mt-1.5 text-xs text-danger">
                  {errors.email.message}
                </p>
              ) : null}
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
                  Đang gửi mã...
                </>
              ) : (
                <>
                  <Send aria-hidden="true" />
                  Gửi mã OTP
                </>
              )}
            </Button>
          </form>

          {submitError ? (
            <StatusMessage tone="error">{submitError}</StatusMessage>
          ) : null}
          {submitSuccess ? (
            <StatusMessage tone="success">{submitSuccess}</StatusMessage>
          ) : null}

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-primary">Lưu ý</p>
              <p className="mt-1 text-muted">
                Mã OTP sẽ được gửi đến email bạn đã đăng ký tài khoản.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`mt-5 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${
        tone === "error"
          ? "bg-danger/10 text-danger"
          : "bg-success/10 text-success"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
