import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ và tên.")
      .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ và tên không được vượt quá 100 ký tự."),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email.")
      .email("Địa chỉ email không hợp lệ.")
      .max(254, "Email không được vượt quá 254 ký tự."),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu.")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .max(64, "Mật khẩu không được vượt quá 64 ký tự.")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất một chữ thường.")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất một chữ hoa.")
      .regex(/\d/, "Mật khẩu phải có ít nhất một chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu.").max(64, "Mật khẩu xác nhận không được vượt quá 64 ký tự."),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
    terms: z.boolean().refine((accepted) => accepted, {
      message: "Bạn cần đồng ý với điều khoản để tiếp tục.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp.",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
