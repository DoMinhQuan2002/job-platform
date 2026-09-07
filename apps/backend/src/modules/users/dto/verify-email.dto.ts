import { z } from "zod";
import { AppError } from "@/common/errors/app-error";
import { OTP_LENGTH } from "@/modules/auth/auth.constants";

export const verifyEmailDtoSchema = z.object({
  code: z
    .string({ error: "Mã OTP là bắt buộc" })
    .trim()
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Mã OTP phải gồm đúng ${OTP_LENGTH} chữ số`),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailDtoSchema>;

export const parseVerifyEmailDto = (data: unknown): VerifyEmailDto => {
  const result = verifyEmailDtoSchema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      result.error.flatten(),
    );
  }
  return result.data;
};
