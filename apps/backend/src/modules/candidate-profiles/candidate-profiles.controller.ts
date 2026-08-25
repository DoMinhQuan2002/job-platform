import { Request, Response } from "express";
import { CandidateProfilesService } from "./candidate-profiles.service";
import { z } from "zod";
import { SkillCategory, SkillLevel } from "@/common/constants";

type ValidationErrorItem = {
  field: string;
  message: string;
};

const service = new CandidateProfilesService();

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Phải đúng định dạng YYYY-MM-DD");

const refineCurrentEndDate = (
  data: { startDate?: string; endDate?: string | null; isCurrent?: boolean },
  ctx: z.RefinementCtx,
  mode: "create" | "update",
) => {
  const isCurrent = mode === "create" ? (data.isCurrent ?? false) : data.isCurrent === true;
  if (isCurrent && data.endDate != null) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "isCurrent=true thì endDate phải null",
    });
  }
  if (
    data.startDate &&
    data.endDate &&
    (mode === "create" ? !isCurrent : data.isCurrent !== true) &&
    data.endDate < data.startDate
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "endDate phải >= startDate",
    });
  }
};

const educationCreateSchema = z
  .object({
    school: z.string().min(1).max(255),
    major: z.string().max(255).nullable().optional(),
    degree: z.string().max(100).nullable().optional(),
    startDate: dateStringSchema,
    endDate: dateStringSchema.nullable().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => refineCurrentEndDate(data, ctx, "create"));

const educationUpdateSchema = z
  .object({
    school: z.string().min(1).max(255).optional(),
    major: z.string().max(255).nullable().optional(),
    degree: z.string().max(100).nullable().optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.nullable().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => refineCurrentEndDate(data, ctx, "update"));

const workExperienceCreateSchema = z
  .object({
    companyName: z.string().min(1).max(255),
    position: z.string().min(1).max(255),
    startDate: dateStringSchema,
    endDate: dateStringSchema.nullable().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => refineCurrentEndDate(data, ctx, "create"));

const workExperienceUpdateSchema = z
  .object({
    companyName: z.string().min(1).max(255).optional(),
    position: z.string().min(1).max(255).optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.nullable().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => refineCurrentEndDate(data, ctx, "update"));

const skillCategorySchema = z.enum(SkillCategory);
const skillLevelSchema = z.enum(SkillLevel);

const skillCatalogQuerySchema = z.object({
  category: skillCategorySchema.optional(),
});

const skillCatalogCreateSchema = z.object({
  name: z.string().min(1).max(100),
  category: skillCategorySchema,
  code: z.string().max(10).nullable().optional(),
  description: z.string().nullable().optional(),
});

const attachSkillSchema = z.object({
  skillId: z.string().min(1),
  level: skillLevelSchema,
});

const updateSkillLevelSchema = z.object({
  level: skillLevelSchema,
});

const sendUnauthorized = (res: Response) => {
  return res.status(401).json({
    success: false,
    message: "Chưa đăng nhập hoặc token không hợp lệ",
    errors: [],
  });
};

const sendForbidden = (res: Response) => {
  return res.status(403).json({
    success: false,
    message: "Bạn không có quyền thực hiện thao tác này",
    errors: [],
  });
};

const sendValidationError = (res: Response, errors: ValidationErrorItem[]) => {
  return res.status(400).json({
    success: false,
    message: "Dữ liệu không hợp lệ",
    errors,
  });
};

const sendNotFound = (res: Response, message = "Không tìm thấy") => {
  return res.status(404).json({
    success: false,
    message,
    errors: [],
  });
};

const sendConflict = (res: Response, message: string) => {
  return res.status(409).json({
    success: false,
    message,
    errors: [],
  });
};

const zodIssuesToErrors = (issues: z.core.$ZodIssue[]): ValidationErrorItem[] => {
  return issues.map((issue) => ({
    field: String(issue.path?.[0] ?? "body"),
    message: issue.message,
  }));
};

const ensureCandidate = (req: Request, res: Response): string | null => {
  if (!req.user?.id) {
    sendUnauthorized(res);
    return null;
  }

  if (req.user.role !== "CANDIDATE") {
    sendForbidden(res);
    return null;
  }

  return req.user.id;
};

const ensureAdmin = (req: Request, res: Response): string | null => {
  if (!req.user?.id) {
    sendUnauthorized(res);
    return null;
  }

  if (req.user.role !== "ADMIN") {
    sendForbidden(res);
    return null;
  }

  return req.user.id;
};

export const getMyCandidateProfile = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const data = await service.getAggregateByUserId(userId);
  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const updateMyCandidateProfile = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const body = req.body as Record<string, unknown>;
  const errors: ValidationErrorItem[] = [];

  const forbiddenNestedFields = [
    "educations",
    "workExperiences",
    "skills",
    "languages",
    "certificates",
  ];

  for (const field of forbiddenNestedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      errors.push({
        field,
        message: `${field} không được phép trong PUT /candidates/me`,
      });
    }
  }

  const schema = z
    .object({
      bio: z.string().nullable().optional(),
      careerObjective: z.string().nullable().optional(),
    })
    .loose();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    errors.push(...zodIssuesToErrors(parsed.error.issues));
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  const payload: { bio?: string | null; careerObjective?: string | null } = {};
  if (Object.prototype.hasOwnProperty.call(body, "bio")) {
    payload.bio = parsed.data!.bio as string | null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "careerObjective")) {
    payload.careerObjective = parsed.data!.careerObjective as string | null;
  }

  const data = await service.updateProfileText(userId, payload);
  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const listMyEducations = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const data = await service.listEducations(userId);
  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const createMyEducation = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const parsed = educationCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.createEducation(userId, parsed.data);
  return res.status(201).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const updateMyEducation = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const educationId = String(req.params.id || "");
  if (!educationId) {
    return sendNotFound(res, "Không tìm thấy học vấn");
  }

  const parsed = educationUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.updateEducation(userId, educationId, parsed.data);
  if (!data) {
    return sendNotFound(res, "Không tìm thấy học vấn");
  }

  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const deleteMyEducation = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const educationId = String(req.params.id || "");
  if (!educationId) {
    return sendNotFound(res, "Không tìm thấy học vấn");
  }

  const deleted = await service.deleteEducation(userId, educationId);
  if (!deleted) {
    return sendNotFound(res, "Không tìm thấy học vấn");
  }

  return res.status(200).json({
    success: true,
    message: "Thành công",
    data: null,
  });
};

export const listMyWorkExperiences = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const data = await service.listWorkExperiences(userId);
  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const createMyWorkExperience = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const parsed = workExperienceCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.createWorkExperience(userId, parsed.data);
  return res.status(201).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const updateMyWorkExperience = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const workExperienceId = String(req.params.id || "");
  if (!workExperienceId) {
    return sendNotFound(res, "Không tìm thấy kinh nghiệm");
  }

  const parsed = workExperienceUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.updateWorkExperience(userId, workExperienceId, parsed.data);
  if (!data) {
    return sendNotFound(res, "Không tìm thấy kinh nghiệm");
  }

  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const deleteMyWorkExperience = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const workExperienceId = String(req.params.id || "");
  if (!workExperienceId) {
    return sendNotFound(res, "Không tìm thấy kinh nghiệm");
  }

  const deleted = await service.deleteWorkExperience(userId, workExperienceId);
  if (!deleted) {
    return sendNotFound(res, "Không tìm thấy kinh nghiệm");
  }

  return res.status(200).json({
    success: true,
    message: "Thành công",
    data: null,
  });
};

export const listSkillCatalog = async (req: Request, res: Response) => {
  const parsed = skillCatalogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.listSkillCatalog(parsed.data.category);
  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const createSkillCatalog = async (req: Request, res: Response) => {
  const userId = ensureAdmin(req, res);
  if (!userId) return;

  const parsed = skillCatalogCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.createSkillCatalog(parsed.data);
  if (data === "CONFLICT") {
    return sendConflict(res, "Skill đã tồn tại");
  }

  return res.status(201).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const listMySkills = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const data = await service.listMySkills(userId);
  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const attachMySkill = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const parsed = attachSkillSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.attachSkill(userId, parsed.data.skillId, parsed.data.level);
  if (data === "NOT_FOUND") {
    return sendNotFound(res, "Không tìm thấy skill");
  }
  if (data === "INACTIVE") {
    return sendValidationError(res, [
      { field: "skillId", message: "Skill phải ở trạng thái ACTIVE" },
    ]);
  }
  if (data === "CONFLICT") {
    return sendConflict(res, "Skill đã được gắn");
  }

  return res.status(201).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const updateMySkill = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const candidateSkillId = String(req.params.id || "");
  if (!candidateSkillId) {
    return sendNotFound(res, "Không tìm thấy skill đã gắn");
  }

  const parsed = updateSkillLevelSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, zodIssuesToErrors(parsed.error.issues));
  }

  const data = await service.updateMySkillLevel(userId, candidateSkillId, parsed.data.level);
  if (!data) {
    return sendNotFound(res, "Không tìm thấy skill đã gắn");
  }

  return res.status(200).json({
    success: true,
    message: "Thành công",
    data,
  });
};

export const detachMySkill = async (req: Request, res: Response) => {
  const userId = ensureCandidate(req, res);
  if (!userId) return;

  const candidateSkillId = String(req.params.id || "");
  if (!candidateSkillId) {
    return sendNotFound(res, "Không tìm thấy skill đã gắn");
  }

  const deleted = await service.detachSkill(userId, candidateSkillId);
  if (!deleted) {
    return sendNotFound(res, "Không tìm thấy skill đã gắn");
  }

  return res.status(200).json({
    success: true,
    message: "Thành công",
    data: null,
  });
};
