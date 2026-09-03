"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Field } from "../login/page";
import { inputClassName } from "../login/page";
import {
  useForm,
  useWatch,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/lib/api-error";
import {
  registerSchema,
  type RegisterFormValues,
} from "./register.schema";
import { authApi } from "@/services/auth.service";

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

function getPasswordStrength(password: string) {
  if (!password) return 0;

  return [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
  ].filter(Boolean).length;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [, setUnverifiedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CANDIDATE",
      terms: false,
    },
  });

  const password = useWatch({ control, name: "password" });
  const selectedRole = useWatch({ control, name: "role" });
  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = ["Chưa nhập", "Yếu", "Trung bình", "Mạnh"][passwordStrength];

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const response = await authApi.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      setSubmitSuccess(
        response.message ||
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      );
      const query = new URLSearchParams({
        email: response.data.email,
        expiresIn: String(response.data.otpExpiresIn),
      });
      router.push(`${ROUTES.auth.verifyOtp}?${query.toString()}`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(values.email.trim());
        return;
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể đăng ký lúc này. Vui lòng thử lại.",
      );
    }
  });

  return (
    <div className=" container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
      <section
        className="hidden flex-col pb-8 pt-8 lg:flex"
        aria-labelledby="register-introduction"
      >
        <div className="mb-6 inline-flex w-max items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
          <BadgeCheck className="size-4" aria-hidden="true" />
          <span className="text-sm font-medium">Nền tảng tuyển dụng uy tín</span>
        </div>

        <h1
          id="register-introduction"
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

      <section
        className="justify-self-end w-full max-w-lg rounded-2xl border border-border/70 bg-white p-6 shadow-sm md:p-10"
        aria-labelledby="register-title"
      >
        <div className="mb-8 text-center">
          <h1 id="register-title" className="mb-2 text-2xl font-bold text-text">
            Đăng ký tài khoản
          </h1>
          <p className="text-sm text-muted">
            Vui lòng nhập thông tin để tạo tài khoản mới
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <Field label="Họ và tên" htmlFor="fullName" error={errors.fullName?.message}>
            <InputIcon icon={UserRound} />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Nhập họ và tên của bạn"
              aria-invalid={Boolean(errors.fullName)}
              className={inputClassName}
              {...register("fullName")}
            />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <InputIcon icon={Mail} />
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

          <Field label="Mật khẩu" htmlFor="password" error={errors.password?.message}>
            <InputIcon icon={LockKeyhole} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Nhập mật khẩu"
              aria-invalid={Boolean(errors.password)}
              className={`${inputClassName} pr-10`}
              {...register("password")}
            />
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          </Field>

          <Field
            label="Xác nhận mật khẩu"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <InputIcon icon={LockKeyhole} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              aria-invalid={Boolean(errors.confirmPassword)}
              className={`${inputClassName} pr-10`}
              {...register("confirmPassword")}
            />
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
            />
          </Field>

          <div className="-mt-2">
            <p className="mb-2 text-xs text-muted">
              Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số
            </p>
            <div className="grid h-1.5 grid-cols-3 gap-1" aria-hidden="true">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`rounded-full ${passwordStrength >= level ? "bg-primary" : "bg-border"
                    }`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs font-medium text-primary">
              Độ mạnh mật khẩu: {strengthLabel}
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-text">
              Vai trò đăng ký
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <RoleOption
                value="CANDIDATE"
                selected={selectedRole === "CANDIDATE"}
                title="Ứng viên"
                description="Tìm việc làm phù hợp và phát triển sự nghiệp"
                icon={UserRound}
                registration={register("role")}
              />
              <RoleOption
                value="RECRUITER"
                selected={selectedRole === "RECRUITER"}
                title="Nhà tuyển dụng"
                description="Đăng tin tuyển dụng và tìm kiếm ứng viên"
                icon={Building2}
                registration={register("role")}
              />
            </div>
          </fieldset>

          <div>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-primary"
                {...register("terms")}
              />
              <span>
                Tôi đồng ý với{" "}
                <Link href="#" className="font-medium text-primary hover:underline">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link href="#" className="font-medium text-primary hover:underline">
                  Chính sách bảo mật
                </Link>{" "}
                của Job Platform
              </span>
            </label>
            {errors.terms?.message ? (
              <p className="mt-1.5 text-xs text-danger">{errors.terms.message}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full bg-primary text-white hover:bg-primary-hover"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Đã có tài khoản?{" "}
          <Link href={ROUTES.auth.login} className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </section>

      <AppAlertDialog
        open={Boolean(submitError)}
        onOpenChange={(open) => {
          if (!open) setSubmitError("");
        }}
        tone="error"
        title="Đăng ký thất bại"
        description={submitError}
        confirmLabel="Đóng"
        showCancel={false}
      />
    </div>
  );
}

// input icon
type IconComponent = typeof UserRound;

function InputIcon({ icon: Icon }: { icon: IconComponent }) {
  return (
    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

// Password
function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-primary"
      aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}


// Dữ liệu chọn role
type RoleOptionProps = {
  value: RegisterFormValues["role"];
  selected: boolean;
  title: string;
  description: string;
  icon: IconComponent;
  registration: UseFormRegisterReturn<"role">;
};

function RoleOption({
  value,
  selected,
  title,
  description,
  icon: Icon,
  registration,
}: RoleOptionProps) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition ${selected
        ? "border-primary bg-primary/5"
        : "border-border bg-white hover:border-primary/60 hover:bg-primary/5"
        }`}
    >
      <input
        type="radio"
        value={value}
        className="absolute left-3 top-3 size-4 accent-primary"
        {...registration}
      />
      <span
        className={`mb-2 mt-2 flex size-10 items-center justify-center rounded-full ${selected ? "bg-primary text-white" : "bg-primary/10 text-primary"
          }`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="mb-1 block text-sm font-bold text-text">{title}</span>
      <span className="text-xs leading-relaxed text-muted">{description}</span>
    </label>
  );
}
