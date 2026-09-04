"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Send,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/services/auth.service";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Hàng ngàn việc làm chất lượng",
    description: "Cập nhật mỗi ngày từ các công ty uy tín",
  },
  {
    icon: UserRound,
    title: "Hồ sơ nổi bật",
    description: "Tạo CV chuyên nghiệp và thu hút nhà tuyển dụng",
  },
  {
    icon: BellRing,
    title: "Thông báo việc làm phù hợp",
    description: "Nhận gợi ý việc làm phù hợp với bạn",
  },
] as const;

type VerifyOtpPageProps = {
  searchParams: Promise<{
    email?: string;
    expiresIn?: string;
  }>;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const params = use(searchParams);
  const parsedExpiresIn = Number(params.expiresIn);
  const initialExpiresIn =
    Number.isFinite(parsedExpiresIn) && parsedExpiresIn > 0
      ? Math.min(parsedExpiresIn, 3_600)
      : 300;

  return (
    <div className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
      <section
        className="hidden flex-col pb-8 pt-8 lg:flex "
        aria-labelledby="auth-introduction"
      >
        <div className="mb-6 inline-flex w-max items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
          <BadgeCheck className="size-4" aria-hidden="true" />
          <span className="text-sm font-medium">Nền tảng tuyển dụng uy tín</span>
        </div>

        <h1
          id="auth-introduction"
          className="mb-4 text-4xl font-bold leading-tight tracking-tight text-text"
        >
          Tạo tài khoản để
          <br />
          khám phá cơ hội nghề nghiệp
          <br />
          phù hợp với <span className="text-primary">bạn</span>
        </h1>

        <p className="mb-10 max-w-lg leading-relaxed text-muted">
          Tham gia Job Platform để ứng tuyển việc làm, lưu tin tuyển dụng và kết
          nối với nhà tuyển dụng dễ dàng hơn.
        </p>

        <ul className="space-y-6">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-text">{title}</h2>
                <p className="mt-0.5 text-sm text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <VerifyOtpForm
        email={params.email?.trim() || ""}
        initialExpiresIn={initialExpiresIn}
      />
    </div>
  );
}


type VerifyOtpFormProps = {
  email: string;
  initialExpiresIn: number;
};

function VerifyOtpForm({ email, initialExpiresIn }: VerifyOtpFormProps) {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState(() => Array<string>(OTP_LENGTH).fill(""));
  const [expiresIn, setExpiresIn] = useState(initialExpiresIn);
  const [resendCooldown, setResendCooldown] = useState(
    RESEND_COOLDOWN_SECONDS,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiresIn((current) => Math.max(0, current - 1));
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

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

    const nextIndex = Math.min(startIndex + numbers.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!value) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    updateDigits(index, value);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    updateDigits(index, event.clipboardData.getData("text"));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = digits.join("");

    if (!email) {
      setError("Không tìm thấy email cần xác thực. Vui lòng đăng ký lại.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.");
      return;
    }
    if (expiresIn === 0) {
      setError("Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.");
      return;
    }

    setError("");
    setSuccess("");
    setIsVerifying(true);

    try {
      const response = await authApi.verifyRegisterCode({ email, code });
      setSuccess(response.message || "Xác thực tài khoản thành công.");
      router.replace(`${ROUTES.auth.login}?verified=1`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể xác thực mã OTP. Vui lòng thử lại.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || isResending) return;

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await authApi.resendRegisterCode({ email });
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      setExpiresIn(response.data.otpExpiresIn);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccess(response.message || "Mã xác thực mới đã được gửi.");
      inputRefs.current[0]?.focus();
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Không thể gửi lại mã. Vui lòng thử lại.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const codeComplete = digits.every(Boolean);

  return (
    <section
      className="justify-self-end w-full max-w-lg rounded-2xl border border-border/70 bg-white p-6 shadow-sm md:p-10"
      aria-labelledby="verify-otp-title"
    >
      <Link
        href={ROUTES.auth.register}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Quay lại
      </Link>

      <div className="mt-8 text-center">
        <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-8" aria-hidden="true" />
          <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white">
            <LockKeyhole className="size-4" aria-hidden="true" />
          </span>
        </div>

        <h1 id="verify-otp-title" className="text-2xl font-bold text-text">
          Nhập mã xác thực (OTP)
        </h1>
        <p className="mt-2 text-sm text-muted">Mã xác thực đã được gửi đến</p>
        <p className="mt-1 break-all text-sm font-medium text-primary">
          {email || "Email chưa được cung cấp"}
        </p>
      </div>

      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend className="sr-only">Mã xác thực gồm 6 chữ số</legend>
          <div className="grid grid-cols-6 gap-2 sm:gap-4">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Chữ số OTP thứ ${index + 1}`}
                className="aspect-square min-w-0 rounded-lg border border-border bg-white text-center text-lg font-semibold text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
          <Clock3 className="size-4" aria-hidden="true" />
          <span>
            {expiresIn > 0 ? "Mã sẽ hết hạn sau" : "Mã xác thực đã hết hạn"}{" "}
            {expiresIn > 0 ? (
              <strong className="font-medium text-primary">
                {formatTime(expiresIn)}
              </strong>
            ) : null}
          </span>
        </div>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

        <Button
          type="submit"
          size="lg"
          className="mt-6 h-14 w-full text-base font-semibold hover:bg-primary-hover"
          disabled={!codeComplete || !email || isVerifying}
        >
          {isVerifying ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Đang xác minh...
            </>
          ) : (
            "Xác minh"
          )}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4 text-sm text-muted">
        <span className="h-px flex-1 bg-border" />
        Không nhận được mã?
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-14 w-full border-border bg-white text-base text-primary hover:border-primary hover:bg-primary/5 hover:text-primary"
        onClick={handleResend}
        disabled={!email || resendCooldown > 0 || isResending}
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
    </section>
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
      className={`mt-5 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${tone === "error"
        ? "bg-danger/10 text-danger"
        : "bg-success/10 text-success"
        }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function VerifyOtpSkeleton() {
  return (
    <div
      className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12"
      aria-busy="true"
      aria-label="Đang tải trang xác thực OTP"
    >
      <section className="hidden min-h-[580px] flex-col pb-8 pt-8 lg:flex" aria-hidden="true">
        <div className="skeleton h-[580px] w-full rounded-2xl" />
      </section>
      <section className="w-full max-w-lg justify-self-end" aria-hidden="true">
        <div className="skeleton h-[580px] w-full rounded-2xl" />
      </section>
    </div>
  );
}
