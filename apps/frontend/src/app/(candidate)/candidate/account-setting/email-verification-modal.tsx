"use client";

import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  RefreshCw,
  X,
} from "lucide-react";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { candidateApi } from "@/modules/candidate/api";

const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: (emailVerifiedAt: string) => void;
};

export function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasSentInitialOtp = useRef(false);

  // Send OTP on initial open
  useEffect(() => {
    if (!isOpen) {
      hasSentInitialOtp.current = false;
      setDigits(Array(OTP_LENGTH).fill(""));
      setError("");
      setFailedAttempts(0);
      return;
    }

    if (!hasSentInitialOtp.current) {
      hasSentInitialOtp.current = true;
      sendOtp();
    }
  }, [isOpen]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async () => {
    setSendingOtp(true);
    setError("");
    try {
      const res = await candidateApi.sendEmailVerificationOtp();
      setCooldown(res.data?.cooldownSeconds ?? RESEND_COOLDOWN_SECONDS);
      setFailedAttempts(0);
      setDigits(Array(OTP_LENGTH).fill(""));
      toast.success("Mã xác thực đã được gửi đến email của bạn");
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể gửi mã xác thực";
      setError(msg);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    if (failedAttempts >= MAX_ATTEMPTS) return;
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    const digit = cleaned.slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (failedAttempts >= MAX_ATTEMPTS) return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setError("");

    const targetIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError(`Vui lòng nhập đầy đủ ${OTP_LENGTH} chữ số.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await candidateApi.verifyEmail(code);
      toast.success("Xác thực email thành công!");
      onSuccess(res.data.emailVerifiedAt);
      onClose();
    } catch (err: unknown) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      setDigits(Array(OTP_LENGTH).fill(""));

      if (nextAttempts >= MAX_ATTEMPTS) {
        setError(
          `Bạn đã nhập sai mã ${MAX_ATTEMPTS} lần. Vui lòng bấm "Gửi lại mã" để nhận mã mới.`,
        );
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Mã xác thực không chính xác hoặc đã hết hạn.";
        setError(`${msg} (Còn ${MAX_ATTEMPTS - nextAttempts} lần thử)`);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isLocked = failedAttempts >= MAX_ATTEMPTS;
  const isComplete = digits.every((d) => d.length === 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-email-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all sm:p-7">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-6" />
          </div>
          <h2 id="verify-email-title" className="mt-4 text-xl font-bold text-slate-900">
            Xác thực địa chỉ Email
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Mã xác thực gồm 6 chữ số đã được gửi đến:
            <br />
            <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        {/* OTP Input Fields */}
        <div className="mt-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                disabled={isLocked || loading || sendingOtp}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`size-11 rounded-xl border text-center text-lg font-bold outline-none transition sm:size-12 ${
                  isLocked
                    ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                    : digit
                      ? "border-primary bg-primary/5 text-slate-900 ring-2 ring-primary/20"
                      : "border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs leading-relaxed text-danger">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              onClick={handleVerify}
              disabled={!isComplete || isLocked || loading || sendingOtp}
              className="h-11 w-full text-sm font-semibold"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Xác thực"
              )}
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={sendOtp}
                disabled={cooldown > 0 || sendingOtp || loading}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
              >
                <RefreshCw
                  className={`size-3.5 ${sendingOtp ? "animate-spin" : ""}`}
                />
                {sendingOtp
                  ? "Đang gửi lại..."
                  : cooldown > 0
                    ? `Gửi lại mã (${cooldown}s)`
                    : "Gửi lại mã mới"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
