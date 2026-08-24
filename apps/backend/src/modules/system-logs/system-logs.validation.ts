import { z } from "zod";
import { AppError } from "@/common/errors/app-error";
import { LogAction } from "@/database/entities/system-log.entity";

/**
 * 11 giá trị đang dùng thật (đã tài liệu hóa). `UPDATE_APPLICATION_STATUS` vẫn còn
 * khai báo trong entity để dành sẵn cho Nhóm 2/3, nhưng chưa đưa vào phạm vi lọc này.
 */
const LOG_ACTIONS = [
  "LOCK_USER",
  "UNLOCK_USER",
  "LOCK_COMPANY",
  "UNLOCK_COMPANY",
  "APPROVE_JOB",
  "REJECT_JOB",
  "DELETE_JOB",
  "CREATE_JOB_CATEGORY",
  "UPDATE_JOB_CATEGORY",
  "DELETE_JOB_CATEGORY",
  "LOGIN_FAILED",
] as const satisfies readonly LogAction[];

const TARGET_TYPES = ["USER", "COMPANY", "JOB", "JOB_CATEGORY"] as const;

type ValidationError = { field: string; message: string };

const fail = (schemaError: z.ZodError): never => {
  const errors: ValidationError[] = schemaError.issues.map((issue) => ({
    field: String(issue.path[0] ?? "unknown"),
    message: issue.message,
  }));
  throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", errors);
};

const listQuerySchema = z
  .object({
    page: z.coerce
      .number({ error: "page phải là số nguyên >= 1" })
      .int("page phải là số nguyên >= 1")
      .min(1, "page phải là số nguyên >= 1")
      .default(1),
    limit: z.coerce
      .number({ error: "limit phải từ 1 đến 100" })
      .int("limit phải từ 1 đến 100")
      .min(1, "limit phải từ 1 đến 100")
      .max(100, "limit phải từ 1 đến 100")
      .default(20),
    userId: z.string().regex(/^\d+$/, "userId phải là số nguyên dương").optional(),
    action: z.enum(LOG_ACTIONS, { error: "Giá trị action không hợp lệ" }).optional(),
    targetType: z.enum(TARGET_TYPES, { error: "Giá trị targetType không hợp lệ" }).optional(),
    targetId: z.string().regex(/^\d+$/, "targetId phải là số nguyên dương").optional(),
    fromDate: z.iso.date({ error: "fromDate phải là ngày hợp lệ (YYYY-MM-DD)" }).optional(),
    toDate: z.iso.date({ error: "toDate phải là ngày hợp lệ (YYYY-MM-DD)" }).optional(),
  })
  .refine((data) => !(data.targetId && !data.targetType), {
    error: "Phải truyền kèm targetType",
    path: ["targetId"],
  })
  .refine((data) => !(data.fromDate && data.toDate && data.fromDate > data.toDate), {
    error: "toDate phải lớn hơn hoặc bằng fromDate",
    path: ["toDate"],
  });

export type ListQuery = z.infer<typeof listQuerySchema>;

export const validateListQuery = (query: Record<string, unknown>): ListQuery => {
  const result = listQuerySchema.safeParse(query);
  if (!result.success) throw fail(result.error);
  return result.data;
};

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id phải là số nguyên dương"),
});

export const validateIdParam = (params: Record<string, unknown>): string => {
  const result = idParamSchema.safeParse(params);
  if (!result.success) throw fail(result.error);
  return result.data.id;
};
