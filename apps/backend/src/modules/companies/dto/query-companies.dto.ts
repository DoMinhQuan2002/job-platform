import { z } from "zod";
import { COMPANY_SIZE } from "../../../common/constants/job";

export const queryCompaniesSchema = z.object({
  page: z.coerce
    .number({ error: "page phải là số nguyên hợp lệ" })
    .int("page phải là số nguyên")
    .min(1, "page phải lớn hơn hoặc bằng 1")
    .default(1),
  limit: z.coerce
    .number({ error: "limit phải là số nguyên hợp lệ" })
    .int("limit phải là số nguyên")
    .min(1, "limit phải lớn hơn hoặc bằng 1")
    .max(100, "limit tối đa là 100")
    .default(10),
  search: z.string().trim().optional(),
  sort: z.enum(["newest", "oldest"], {
    error: "Sắp xếp công ty không hợp lệ (chọn: 'newest', 'oldest')",
  }).default("newest"),
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
    .optional(),
});

export type QueryCompaniesDto = z.infer<typeof queryCompaniesSchema>;
