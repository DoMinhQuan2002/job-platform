import { z } from "zod";
import { AppError } from "@/common/errors/app-error";

const password = z
  .string()
  .min(8, "Mật khẩu phải từ 8 đến 72 ký tự")
  .max(72, "Mật khẩu phải từ 8 đến 72 ký tự")
  .regex(/[a-z]/, "Mật khẩu phải có chữ thường")
  .regex(/[A-Z]/, "Mật khẩu phải có chữ hoa")
  .regex(/[0-9]/, "Mật khẩu phải có chữ số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải có ký tự đặc biệt");

const schema = z
  .object({ currentPassword: z.string().min(1), newPassword: password })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "newPassword không được giống currentPassword",
  });

export type ChangeMyPasswordDto = z.infer<typeof schema>;

export const parseChangeMyPasswordDto = (body: unknown): ChangeMyPasswordDto => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", result.error.issues);
  }
  return result.data;
};
