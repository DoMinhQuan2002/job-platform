import { z } from "zod";

export const getCompanyByIdParamsSchema = z.object({
  id: z
    .string({ error: "id hoặc slug công ty là bắt buộc" })
    .trim()
    .min(1, "id hoặc slug công ty là bắt buộc")
    .refine((value) => {
      if (/^\d+$/.test(value)) {
        return BigInt(value) > 0n;
      }

      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
    }, "id hoặc slug công ty không hợp lệ"),
});

export type GetCompanyByIdParamsDto = z.infer<typeof getCompanyByIdParamsSchema>;
