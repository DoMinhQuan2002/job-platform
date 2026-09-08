import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Địa chỉ email không hợp lệ.")
    .max(254, "Email không được vượt quá 254 ký tự."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(64, "Mật khẩu không được vượt quá 64 ký tự."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
