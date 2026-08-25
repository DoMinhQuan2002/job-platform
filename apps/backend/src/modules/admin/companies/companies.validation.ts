// Validation zod cho 3 API quản lý công ty của admin (list/detail/khóa-mở khóa).
import { z } from "zod";
import { AppError } from "@/common/errors/app-error";

const STATUSES = ["ACTIVE", "BLOCKED"] as const;

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
  search: z.string().trim().min(1).optional(),
  status: z.enum(STATUSES, { error: "Giá trị status không hợp lệ" }).optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

/** Validate query của GET /admin/companies. */
export const validateListQuery = (query: Record<string, unknown>): ListQuery => {
  const result = listQuerySchema.safeParse(query);
  if (!result.success) throw fail(result.error);
  return result.data;
};

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id phải là số nguyên dương"),
});

/** Validate `id` trên path — dùng chung cho detail và đổi trạng thái. */
export const validateIdParam = (params: Record<string, unknown>): string => {
  const result = idParamSchema.safeParse(params);
  if (!result.success) throw fail(result.error);
  return result.data.id;
};

const statusBodySchema = z
  .object({
    status: z.enum(STATUSES, { error: "Giá trị status không hợp lệ" }),
    reason: z
      .string()
      .min(10, "Lý do phải từ 10 đến 500 ký tự")
      .max(500, "Lý do phải từ 10 đến 500 ký tự")
      .optional(),
  })
  .refine((data) => data.status !== "BLOCKED" || !!data.reason, {
    error: "Lý do là bắt buộc khi khóa công ty",
    path: ["reason"],
  });

export type StatusBody = z.infer<typeof statusBodySchema>;

/** Validate body của PUT /admin/companies/{id}/status — reason bắt buộc khi khóa. */
export const validateStatusBody = (body: unknown): StatusBody => {
  const result = statusBodySchema.safeParse(body);
  if (!result.success) throw fail(result.error);
  return result.data;
};
