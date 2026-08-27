import { z } from "zod";

const optionalMoney = z.string().trim().refine(
  (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
  "Mức lương phải là số không âm",
);

export const jobFormSchema = z
  .object({
    title: z.string().trim().min(1, "Vui lòng nhập tên vị trí").max(255, "Tối đa 255 ký tự"),
    categoryId: z.string().min(1, "Vui lòng chọn ngành nghề"),
    address: z.string().trim().min(1, "Vui lòng nhập địa điểm").max(255, "Tối đa 255 ký tự"),
    jobType: z.enum(["FULL_TIME", "PART_TIME"], { error: "Vui lòng chọn hình thức làm việc" }),
    jobMode: z.enum(["ONSITE", "REMOTE", "HYBRID"], { error: "Vui lòng chọn loại hình" }),
    experience: z.number().int().min(0, "Kinh nghiệm không hợp lệ"),
    quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
    salaryMin: optionalMoney,
    salaryMax: optionalMoney,
    isNegotiable: z.boolean(),
    deadline: z.string().min(1, "Vui lòng chọn hạn nộp"),
    description: z.string().trim().min(1, "Vui lòng nhập mô tả công việc").max(5000, "Tối đa 5000 ký tự"),
    requirements: z.string().trim().min(1, "Vui lòng nhập yêu cầu ứng viên").max(5000, "Tối đa 5000 ký tự"),
    benefits: z.string().trim().max(3000, "Tối đa 3000 ký tự"),
    skills: z.array(z.object({ skillId: z.string(), isRequired: z.boolean() })),
  })
  .superRefine((value, context) => {
    if (!value.isNegotiable && value.salaryMin && value.salaryMax && Number(value.salaryMin) > Number(value.salaryMax)) {
      context.addIssue({ code: "custom", path: ["salaryMax"], message: "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu" });
    }
  });

export type JobFormValues = z.infer<typeof jobFormSchema>;

export const emptyJobFormValues: JobFormValues = {
  title: "",
  categoryId: "",
  address: "",
  jobType: "FULL_TIME",
  jobMode: "ONSITE",
  experience: 0,
  quantity: 1,
  salaryMin: "",
  salaryMax: "",
  isNegotiable: false,
  deadline: "",
  description: "",
  requirements: "",
  benefits: "",
  skills: [],
};
