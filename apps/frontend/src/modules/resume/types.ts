export type Resume = {
  id: string;
  candidateId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SkillCategory = "SKILL" | "LANGUAGE" | "CERTIFICATE";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
};

export type CandidateSkill = {
  id: string;
  skillId: string;
  name: string;
  category: SkillCategory;
  level: string | null;
};

export type UpsertMySkillInput = {
  skillId: string;
  level?: string | null;
};
