import { z } from "zod";

export const getCompanyByIdParamsSchema = z.object({
  id: z
    .string({ error: "id công ty là bắt buộc" })
    .trim()
    .regex(/^\d+$/, "id công ty phải là số nguyên dương")
    .refine((id) => BigInt(id) > 0n, "id công ty phải là số nguyên dương"),
});

export type GetCompanyByIdParamsDto = z.infer<typeof getCompanyByIdParamsSchema>;
