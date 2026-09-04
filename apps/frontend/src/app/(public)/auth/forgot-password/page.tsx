"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/services/auth.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from "./forgotPasswordPage.schema";

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN = 5 * 60;
const RESEND_COOLDOWN = 60;
type Step = 1 | 2 | 3;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(() => Array<string>(OTP_LENGTH).fill(""));
  const [expiresIn, setExpiresIn] = useState(OTP_EXPIRES_IN);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [resetToken, setResetToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (step !== 2) return;
    const timer = window.setInterval(() => {
      setExpiresIn((current) => Math.max(0, current - 1));
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [step]);

  const clearStatus = () => {
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleEmailSubmit = emailForm.handleSubmit(async (values) => {
    clearStatus();
    const normalizedEmail = values.email.trim();
    try {
      await authApi.forgotPassword({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      setExpiresIn(OTP_EXPIRES_IN);
      setResendCooldown(RESEND_COOLDOWN);
      setSubmitSuccess("");
      setStep(2);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể gửi mã OTP lúc này. Vui lòng thử lại.",
      );
    }
  });

  const updateDigits = (startIndex: number, value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, OTP_LENGTH - startIndex);
    if (!numbers) return;
    setDigits((current) => {
      const next = [...current];
      numbers.split("").forEach((number, offset) => {
        next[startIndex + offset] = number;
      });
      return next;
    });
    otpRefs.current[Math.min(startIndex + numbers.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value) return updateDigits(index, value);
    setDigits((current) => {
      const next = [...current];
      next[index] = "";
      return next;
    });
  };

  const handleOtpKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    updateDigits(index, event.clipboardData.getData("text"));
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearStatus();
    const code = digits.join("");
    if (!/^\d{6}$/.test(code)) {
      return setSubmitError("Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.");
    }
    if (expiresIn === 0) {
      return setSubmitError("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
    }
    setIsVerifying(true);
    try {
      const response = await authApi.verifyForgotPasswordCode({ email, code });
      setResetToken(response.data.resetToken);
      setStep(3);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể xác minh mã OTP. Vui lòng thử lại.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || isResending) return;
    clearStatus();
    setIsResending(true);
    try {
      const response = await authApi.resendForgotPasswordCode({ email });
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      setExpiresIn(OTP_EXPIRES_IN);
      setResendCooldown(RESEND_COOLDOWN);
      setSubmitSuccess(response.message || "Mã OTP mới đã được gửi.");
      otpRefs.current[0]?.focus();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể gửi lại mã OTP. Vui lòng thử lại.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    clearStatus();
    if (!resetToken) {
      return setSubmitError(
        "Phiên đặt lại mật khẩu không hợp lệ. Vui lòng thực hiện lại từ đầu.",
      );
    }
    try {
      await authApi.resetPassword({ resetToken, newPassword: values.password });
      router.replace(`${ROUTES.auth.login}?reset=1`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      );
    }
  });

  return (
    <div className="flex min-h-[calc(100vh-220px)] items-center justify-center px-4 py-8 md:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] md:grid-cols-[0.8fr_1.2fr]">
        <Illustration />

        <section
          className="flex min-h-140 flex-col justify-center p-6 sm:p-10 lg:p-16"
          aria-labelledby="forgot-password-title"
        >
          <StepBadge step={step} />

          {step === 1 && (
            <EmailStep
              form={emailForm}
              onSubmit={handleEmailSubmit}
              error={submitError}
              success={submitSuccess}
            />
          )}

          {step === 2 && (
            <>
              <h1
                id="forgot-password-title"
                className="text-3xl font-bold tracking-tight text-text"
              >
                Xác minh mã OTP
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Chúng tôi đã gửi mã OTP 6 số đến email
              </p>
              <p className="break-all text-sm font-semibold text-primary">{email}</p>
              <p className="mb-6 mt-1 text-xs text-muted">
                (Kiểm tra hộp thư spam nếu bạn không thấy email)
              </p>

              <form onSubmit={handleOtpSubmit} noValidate>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-text">
                    Nhập mã OTP
                  </legend>
                  <div className="grid grid-cols-6 gap-2 sm:gap-3">
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpRefs.current[index] = element;
                        }}
                        value={digit}
                        onChange={(event) =>
                          handleOtpChange(index, event.target.value)
                        }
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={(event) => handleOtpPaste(index, event)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        autoFocus={index === 0}
                        aria-label={`Chữ số OTP thứ ${index + 1}`}
                        className="aspect-square min-w-0 rounded-lg border border-border bg-white text-center text-lg font-semibold text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    ))}
                  </div>
                </fieldset>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
                  <Clock3 className="size-4 text-primary" aria-hidden="true" />
                  {expiresIn > 0 ? (
                    <>
                      Mã sẽ hết hạn sau{" "}
                      <strong className="font-semibold text-primary">
                        {formatTime(expiresIn)}
                      </strong>
                    </>
                  ) : (
                    <strong className="text-danger">Mã đã hết hạn</strong>
                  )}
                </div>

                <StatusArea error={submitError} success={submitSuccess} />

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 h-12 w-full bg-primary text-base text-white hover:bg-primary-hover"
                  disabled={!digits.every(Boolean) || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <LoaderCircle className="animate-spin" aria-hidden="true" />
                      Đang xác minh...
                    </>
                  ) : (
                    <>
                      <Check aria-hidden="true" />
                      Xác minh
                    </>
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-4 text-sm text-muted">
                <span className="h-px flex-1 bg-border" />
                Chưa nhận được mã?
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-full border-border bg-white text-primary hover:border-primary hover:bg-primary/5 hover:text-primary"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
              >
                {isResending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send aria-hidden="true" />
                )}
                {resendCooldown > 0
                  ? `Gửi lại mã (${resendCooldown}s)`
                  : "Gửi lại mã"}
              </Button>

              <InfoBox title="Lưu ý">
                Mã OTP chỉ có hiệu lực trong 5 phút. Bạn có thể gửi lại mã sau 60 giây.
              </InfoBox>
            </>
          )}

          {step === 3 && (
            <>
              <h1
                id="forgot-password-title"
                className="text-3xl font-bold tracking-tight text-text"
              >
                Đặt mật khẩu mới
              </h1>
              <p className="mb-7 mt-2 max-w-md text-sm leading-6 text-muted">
                Tạo mật khẩu mới cho tài khoản của bạn để hoàn tất quá trình khôi phục.
              </p>

              <form className="space-y-5" onSubmit={handlePasswordSubmit} noValidate>
                <PasswordField
                  id="password"
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  shown={showPassword}
                  maxLength={64}
                  onToggle={() => setShowPassword((current) => !current)}
                  error={passwordForm.formState.errors.password?.message}
                  hint="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số."
                  register={passwordForm.register("password")}
                />

                <PasswordField
                  id="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  shown={showConfirmPassword}
                  maxLength={64}
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  register={passwordForm.register("confirmPassword")}
                />

                <StatusArea error={submitError} success={submitSuccess} />

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full bg-primary text-base text-white hover:bg-primary-hover"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle className="animate-spin" aria-hidden="true" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <LockKeyhole aria-hidden="true" />
                      Lưu mật khẩu mới
                    </>
                  )}
                </Button>

                <Link
                  href={ROUTES.auth.login}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-primary transition hover:border-primary hover:bg-primary/5"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Quay lại đăng nhập
                </Link>
              </form>

              <div className="mt-8 flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-4 text-sm">
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-success">Bảo mật tài khoản</p>
                  <p className="mt-1 text-muted">
                    Không chia sẻ mật khẩu với bất kỳ ai để đảm bảo an toàn cho tài khoản của bạn.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

type EmailForm = ReturnType<typeof useForm<ForgotPasswordFormValues>>;

function EmailStep({
  form,
  onSubmit,
  error,
  success,
}: {
  form: EmailForm;
  onSubmit: () => void;
  error: string;
  success: string;
}) {
  return (
    <>
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
        <FormField
          id="email"
          label="Email"
          error={form.formState.errors.email?.message}
        >
          <Mail
            className="pointer-events-none absolute left-3 top-3.5 size-5 text-muted"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="Nhập email của bạn"
            aria-invalid={Boolean(form.formState.errors.email)}
            className="h-12 w-full rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger"
            {...form.register("email")}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full bg-primary text-base text-white hover:bg-primary-hover"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
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

      <StatusArea error={error} success={success} />

      <InfoBox title="Lưu ý">
        Mã OTP sẽ được gửi đến email bạn đã đăng ký tài khoản.
      </InfoBox>
    </>
  );
}

function Illustration() {
  return (
    <section
      className="hidden min-h-140 items-center justify-center border-r border-border/50 bg-white p-10 md:flex"
      aria-label="Minh họa gửi email xác thực"
    >
      <div className="relative flex size-64 items-center justify-center rounded-full bg-slate-50 lg:size-72">
        <span className="absolute left-8 top-12 text-2xl font-light text-primary/30">
          +
        </span>
        <span className="absolute bottom-10 right-8 text-2xl font-light text-primary/30">
          +
        </span>
        <div className="relative flex h-28 w-36 items-center justify-center rounded-lg bg-primary text-white shadow-xl shadow-primary/25 lg:h-32 lg:w-40">
          <Mail className="size-20 stroke-[1.25] lg:size-24" />
          <Send className="absolute -right-9 -top-8 size-11 rotate-[-8deg] text-primary lg:-right-10 lg:-top-9 lg:size-12" />
        </div>
      </div>
    </section>
  );
}

function StepBadge({ step }: { step: Step }) {
  return (
    <span className="mb-5 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      BƯỚC {step}/3
    </span>
  );
}

function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text">
        {label}
      </label>
      <div className="relative">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type PasswordFieldProps = {
  id: "password" | "confirmPassword";
  label: string;
  placeholder: string;
  shown: boolean;
  maxLength?: number;
  onToggle: () => void;
  error?: string;
  hint?: string;
  register: ReturnType<ReturnType<typeof useForm<ResetPasswordFormValues>>["register"]>;
};

function PasswordField({
  id,
  label,
  placeholder,
  shown,
  maxLength,
  onToggle,
  error,
  hint,
  register,
}: PasswordFieldProps) {
  const Icon = shown ? EyeOff : Eye;

  return (
    <FormField id={id} label={label} error={error} hint={hint}>
      <LockKeyhole
        className="pointer-events-none absolute left-3 top-3.5 size-5 text-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type={shown ? "text" : "password"}
        autoComplete="new-password"
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className="h-12 w-full rounded-lg border border-border bg-white pl-10 pr-11 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger"
        {...register}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-primary"
        aria-label={shown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        <Icon className="size-5" aria-hidden="true" />
      </button>
    </FormField>
  );
}

function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm">
      <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <p className="font-semibold text-primary">{title}</p>
        <p className="mt-1 text-muted">{children}</p>
      </div>
    </div>
  );
}

function StatusArea({ error, success }: { error: string; success: string }) {
  return (
    <>
      {error ? (
        <StatusMessage tone="error">{error}</StatusMessage>
      ) : success ? (
        <StatusMessage tone="success">{success}</StatusMessage>
      ) : null}
    </>
  );
}

function StatusMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
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

export function ForgotPasswordSkeleton() {
  return (
    <div
      className="flex min-h-[calc(100vh-220px)] items-center justify-center px-4 py-8 md:px-8"
      aria-busy="true"
      aria-label="Đang tải trang quên mật khẩu"
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl">
        <div className="skeleton h-[560px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
