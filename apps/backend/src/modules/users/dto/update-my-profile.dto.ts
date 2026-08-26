import { z } from "zod";
import { AppError } from "@/common/errors/app-error";

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

const nullableTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} không được để trống`)
    .max(max, `${label} tối đa ${max} ký tự`)
    .nullable();

const dateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "dateOfBirth phải theo định dạng YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "dateOfBirth không phải ngày hợp lệ")
  .refine((value) => value <= new Date().toISOString().slice(0, 10), "dateOfBirth không được là ngày tương lai")
  .nullable();

const schema = z
  .object({
    fullName: z.string().trim().min(2, "fullName phải từ 2 đến 100 ký tự").max(100, "fullName phải từ 2 đến 100 ký tự").optional(),
    phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "phone không đúng định dạng").nullable().optional(),
    dateOfBirth: dateOfBirth.optional(),
    addressDetail: nullableTrimmed(255, "addressDetail").optional(),
    wardCode: nullableTrimmed(20, "wardCode").optional(),
  })
  .strict();

export type UpdateMyProfileDto = z.infer<typeof schema>;

export const parseUpdateMyProfileDto = (body: unknown): UpdateMyProfileDto => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", result.error.issues);
  }
  if (!hasOwn(result.data, "fullName") && !hasOwn(result.data, "phone") && !hasOwn(result.data, "dateOfBirth") && !hasOwn(result.data, "addressDetail") && !hasOwn(result.data, "wardCode")) {
    throw new AppError(400, "VALIDATION_ERROR", "Cần cung cấp ít nhất một trường cập nhật");
  }
  return result.data;
};
