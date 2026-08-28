import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const statisticsTimeQuerySchema = z
  .object({
    days: z.coerce
      .number({ error: "days phải là số nguyên hợp lệ" })
      .int("days phải là số nguyên")
      .min(1, "days phải lớn hơn hoặc bằng 1")
      .max(365, "days tối đa là 365 ngày")
      .optional(),
    startDate: z
      .string()
      .trim()
      .regex(dateRegex, "startDate phải có định dạng YYYY-MM-DD")
      .optional(),
    endDate: z
      .string()
      .trim()
      .regex(dateRegex, "endDate phải có định dạng YYYY-MM-DD")
      .optional(),
  })
  .refine(
    (data) => {
      if ((data.startDate && !data.endDate) || (!data.startDate && data.endDate)) {
        return false;
      }
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "startDate và endDate phải đi cùng nhau và startDate phải nhỏ hơn hoặc bằng endDate",
      path: ["startDate"],
    },
  );

export type StatisticsTimeQuery = z.infer<typeof statisticsTimeQuerySchema>;

export const applicationsByStatusQuerySchema = statisticsTimeQuerySchema.and(
  z.object({
    jobId: z
      .string()
      .trim()
      .regex(/^\d+$/, "jobId phải là số nguyên dương")
      .refine((id) => BigInt(id) > 0n, "jobId phải là số nguyên dương")
      .optional(),
  }),
);

export type ApplicationsByStatusQuery = z.infer<typeof applicationsByStatusQuerySchema>;

export const recentJobsQuerySchema = z.object({
  limit: z.coerce
    .number({ error: "limit phải là số nguyên hợp lệ" })
    .int("limit phải là số nguyên")
    .min(1, "limit phải lớn hơn hoặc bằng 1")
    .max(50, "limit tối đa là 50")
    .default(5),
});

export type RecentJobsQuery = z.infer<typeof recentJobsQuerySchema>;

export const candidateTrendQuerySchema = statisticsTimeQuerySchema.and(
  z.object({
    groupBy: z.enum(["day", "week", "month"]).default("day"),
  }),
);

export type CandidateTrendQuery = z.infer<typeof candidateTrendQuerySchema>;
