import { z } from "zod";
import { AppError } from "@/common/errors/app-error";
import { NotificationType } from "@/database/entities/notification.entity";

const NOTIFICATION_TYPES = [
  "ACCOUNT_LOCKED",
  "ACCOUNT_UNLOCKED",
  "COMPANY_LOCKED",
  "COMPANY_UNLOCKED",
  "COMPANY_APPROVED",
  "COMPANY_REJECTED",
  "JOB_APPROVED",
  "JOB_REJECTED",
  "JOB_DELETED",
  "NEW_APPLICATION",
  "APPLICATION_STATUS_CHANGED",
] as const satisfies readonly NotificationType[];

type ValidationError = { field: string; message: string };

const fail = (schemaError: z.ZodError): never => {
  const errors: ValidationError[] = schemaError.issues.map((issue) => ({
    field: String(issue.path[0] ?? "unknown"),
    message: issue.message,
  }));
  throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", errors);
};

const listQuerySchema = z.object({
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
  isRead: z
    .enum(["true", "false"], { error: "isRead phải là true hoặc false" })
    .transform((v) => v === "true")
    .optional(),
  // Chấp nhận 1 giá trị, nhiều giá trị lặp key (?type=A&type=B) hoặc phân tách bằng dấu phẩy (?type=A,B)
  // để FE tự gộp nhóm tab (VD "Ứng tuyển" = nhiều type) mà không cần BE định nghĩa nhóm cứng.
  type: z.preprocess(
    (val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === "string") return val.split(",");
      return val;
    },
    z.array(z.enum(NOTIFICATION_TYPES, { error: "Giá trị type không hợp lệ" })).min(1),
  ).optional(),
  from: z.coerce.date({ error: "from phải là ngày hợp lệ (ISO 8601)" }).optional(),
  to: z.coerce.date({ error: "to phải là ngày hợp lệ (ISO 8601)" }).optional(),
}).refine((data) => !data.from || !data.to || data.from <= data.to, {
  error: "from phải trước hoặc bằng to",
  path: ["from"],
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
