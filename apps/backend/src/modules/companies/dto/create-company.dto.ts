import { z } from "zod";
import { COMPANY_SIZE } from "../../../common/constants/job";

export const createCompanySchema = z.object({
  name: z
    .string({ error: "Tên công ty là bắt buộc" })
    .trim()
    .min(1, "Tên công ty không được để trống")
    .max(255, "Tên công ty không được vượt quá 255 ký tự"),
  logo: z
    .string()
    .trim()
    .max(255, "Logo không được vượt quá 255 ký tự")
    .nullable()
    .optional(),
  website: z
    .string()
    .trim()
    .url("Website phải là URL hợp lệ (http:// hoặc https://)")
    .max(255, "Website không được vượt quá 255 ký tự")
    .nullable()
    .optional(),
  email: z
    .string({ error: "Email là bắt buộc" })
    .trim()
    .email("Email không đúng định dạng")
    .max(255, "Email không được vượt quá 255 ký tự"),
  phone: z
    .string({ error: "Số điện thoại là bắt buộc" })
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại VN không hợp lệ (10-11 chữ số)")
    .max(20, "Số điện thoại không được vượt quá 20 ký tự"),
  taxCode: z
    .string()
    .trim()
    .max(50, "Mã số thuế không được vượt quá 50 ký tự")
    .nullable()
    .optional(),
  companySize: z
    .enum(
      [
        COMPANY_SIZE.SIZE_1_50,
        COMPANY_SIZE.SIZE_50_100,
        COMPANY_SIZE.SIZE_100_500,
        COMPANY_SIZE.SIZE_500_PLUS,
      ],
      {
        error: "Quy mô công ty không hợp lệ (chọn: '1-50', '50-100', '100-500', '500+')",
      }
    )
    .nullable()
    .optional(),
  address: z
    .string({ error: "Địa chỉ là bắt buộc" })
    .trim()
    .min(1, "Địa chỉ không được để trống")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  description: z.string().trim().nullable().optional(),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;

