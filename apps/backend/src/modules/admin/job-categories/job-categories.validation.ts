// Validation zod cho 5 API quản lý ngành nghề của admin (CRUD đầy đủ).
import { z } from "zod";
import { AppError } from "@/common/errors/app-error";

const STATUSES = ["ACTIVE", "INACTIVE"] as const;

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

/** Validate query của GET /admin/job-categories. */
export const validateListQuery = (query: Record<string, unknown>): ListQuery => {
  const result = listQuerySchema.safeParse(query);
  if (!result.success) throw fail(result.error);
  return result.data;
};

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "id phải là số nguyên dương"),
});

/** Validate `id` trên path — dùng chung cho detail/update/delete. */
export const validateIdParam = (params: Record<string, unknown>): string => {
  const result = idParamSchema.safeParse(params);
  if (!result.success) throw fail(result.error);
  return result.data.id;
};

const createBodySchema = z.object({
  name: z
    .string({ error: "Tên ngành nghề phải từ 2 đến 150 ký tự" })
    .trim()
    .min(2, "Tên ngành nghề phải từ 2 đến 150 ký tự")
    .max(150, "Tên ngành nghề phải từ 2 đến 150 ký tự"),
  description: z.string().trim().optional(),
});

export type CreateBody = z.infer<typeof createBodySchema>;

/** Validate body của POST /admin/job-categories — không nhận `slug` từ client. */
export const validateCreateBody = (body: unknown): CreateBody => {
  const result = createBodySchema.safeParse(body);
  if (!result.success) throw fail(result.error);
  return result.data;
};

const updateBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên ngành nghề phải từ 2 đến 150 ký tự")
    .max(150, "Tên ngành nghề phải từ 2 đến 150 ký tự")
    .optional(),
  description: z.string().trim().optional(),
  status: z.enum(STATUSES, { error: "Giá trị status không hợp lệ" }).optional(),
});

export type UpdateBody = z.infer<typeof updateBodySchema>;

/** Validate body của PUT /admin/job-categories/{id} — mọi field đều tùy chọn. */
export const validateUpdateBody = (body: unknown): UpdateBody => {
  const result = updateBodySchema.safeParse(body);
  if (!result.success) throw fail(result.error);
  return result.data;
};
