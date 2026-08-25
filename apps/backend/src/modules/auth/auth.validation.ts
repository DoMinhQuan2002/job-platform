import { z } from "zod";
import { ROLES } from "../../common/constants/roles";
import { OTP_LENGTH } from "./auth.constants";

const emailSchema = z
  .string({ required_error: "email là bắt buộc" })
  .trim()
  .min(1, "email là bắt buộc")
  .max(255, "email tối đa 255 ký tự")
  .email("email không đúng định dạng")
  .transform((value) => value.toLowerCase());

/** Toi thieu 8 ky tu, co chu hoa + chu thuong + so (theo Cau hinh chung). */
const passwordSchema = z
  .string({ required_error: "password là bắt buộc" })
  .min(8, "password tối thiểu 8 ký tự")
  .max(72, "password tối đa 72 ký tự")
  .regex(/[a-z]/, "password phải có chữ thường")
  .regex(/[A-Z]/, "password phải có chữ hoa")
  .regex(/\d/, "password phải có số");

const otpCodeSchema = z
  .string({ required_error: "code là bắt buộc" })
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `code phải gồm đúng ${OTP_LENGTH} chữ số`);

/** Dang ky cong khai chi cho chon CANDIDATE / RECRUITER, khong cho tu chon ADMIN. */
const publicRoleSchema = z.enum([ROLES.CANDIDATE, ROLES.RECRUITER], {
  errorMap: () => ({ message: "role chỉ nhận CANDIDATE hoặc RECRUITER" }),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string({ required_error: "fullName là bắt buộc" })
    .trim()
    .min(1, "fullName là bắt buộc")
    .max(100, "fullName tối đa 100 ký tự"),
  role: publicRoleSchema,
});

export const emailOnlySchema = z.object({ email: emailSchema });

export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: "password là bắt buộc" }).min(1, "password là bắt buộc"),
});

export const resetPasswordSchema = z.object({
  resetToken: z
    .string({ required_error: "resetToken là bắt buộc" })
    .trim()
    .min(1, "resetToken là bắt buộc"),
  newPassword: passwordSchema,
});

export const googleLoginSchema = z.object({
  idToken: z
    .string({ required_error: "idToken là bắt buộc" })
    .trim()
    .min(1, "idToken là bắt buộc"),
  role: publicRoleSchema.optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
