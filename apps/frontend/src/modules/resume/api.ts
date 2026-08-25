import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type { CandidateSkill, Resume, Skill, UpsertMySkillInput } from "./types";

export const resumeApi = {
  list: () => http<ApiSuccess<Resume[]>>("/resumes"),

  getById: (id: string) => http<ApiSuccess<Resume>>(`/resumes/${id}`),

  upload: (file: File, isDefault = false) => {
    const form = new FormData();
    form.append("file", file);
    if (isDefault) {
      form.append("isDefault", "true");
    }
    return http<ApiSuccess<Resume>>("/resumes", { method: "POST", body: form });
  },

  setDefault: (id: string) =>
    http<ApiSuccess<Resume>>(`/resumes/${id}/default`, { method: "PUT" }),

  remove: (id: string) => http<ApiSuccess<null>>(`/resumes/${id}`, { method: "DELETE" }),
};

export const skillsApi = {
  listCatalog: (query?: { category?: string; q?: string }) => {
    const qs = query ? `?${new URLSearchParams(query as Record<string, string>).toString()}` : "";
    return http<ApiSuccess<Skill[]>>(`/skills${qs}`);
  },

  listMine: () => http<ApiSuccess<CandidateSkill[]>>("/skills/me"),

  upsertMine: (body: UpsertMySkillInput) =>
    http<ApiSuccess<CandidateSkill>>("/skills/me", { method: "POST", body }),

  removeMine: (skillId: string) =>
    http<ApiSuccess<null>>(`/skills/me/${skillId}`, { method: "DELETE" }),
};
