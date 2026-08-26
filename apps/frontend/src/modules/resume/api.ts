import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import { normalizeCandidateSkill } from "./lib/skills";
import type {
  AggregateSkillItem,
  CandidateSkill,
  Resume,
  Skill,
  UpdateMySkillLevelInput,
  UpsertMySkillInput,
} from "./types";

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

  /**
   * Contract: GET /media/access?storagePath=&assetType=resume
   * `fileUrl` trên resume = storagePath (không phải URL dài hạn).
   */
  getAccessUrl: (storagePath: string) => {
    const qs = new URLSearchParams({
      storagePath,
      assetType: "resume",
    });
    return http<{ data: { url: string; storagePath: string; assetType: string } }>(
      `/media/access?${qs.toString()}`,
    );
  },
};

async function mapMineList(
  promise: Promise<ApiSuccess<AggregateSkillItem[]>>,
): Promise<ApiSuccess<CandidateSkill[]>> {
  const res = await promise;
  if (!res.success || res.data == null) {
    return { ...res, data: [] };
  }
  return { ...res, data: res.data.map(normalizeCandidateSkill) };
}

async function mapMineOne(
  promise: Promise<ApiSuccess<AggregateSkillItem>>,
): Promise<ApiSuccess<CandidateSkill>> {
  const res = await promise;
  if (!res.success || res.data == null) {
    return { ...res, data: undefined as unknown as CandidateSkill };
  }
  return { ...res, data: normalizeCandidateSkill(res.data) };
}

export const skillsApi = {
  listCatalog: (query?: { category?: string; q?: string }) => {
    const qs = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";
    return http<ApiSuccess<Skill[]>>(`/skills${qs}`);
  },

  listMine: () => mapMineList(http<ApiSuccess<AggregateSkillItem[]>>("/skills/me")),

  attachMine: (body: UpsertMySkillInput) =>
    mapMineOne(
      http<ApiSuccess<AggregateSkillItem>>("/skills/me", { method: "POST", body }),
    ),

  /** @deprecated dùng attachMine */
  upsertMine: (body: UpsertMySkillInput) => skillsApi.attachMine(body),

  updateLevel: (candidateSkillId: string, body: UpdateMySkillLevelInput) =>
    mapMineOne(
      http<ApiSuccess<AggregateSkillItem>>(`/skills/me/${candidateSkillId}`, {
        method: "PUT",
        body,
      }),
    ),

  removeMine: (candidateSkillId: string) =>
    http<ApiSuccess<null>>(`/skills/me/${candidateSkillId}`, { method: "DELETE" }),
};
