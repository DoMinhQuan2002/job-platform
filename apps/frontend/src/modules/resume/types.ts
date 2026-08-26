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

export type SkillLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT"
  | "NATIVE";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
};

/** Shape BE `GET/POST /skills/me` */
export type AggregateSkillItem = {
  id: string;
  candidateId: string;
  skillId: string;
  level: SkillLevel;
  skill: {
    id: string;
    name: string;
    category: SkillCategory;
    code?: string | null;
    description?: string | null;
    status?: string;
  };
};

/** Flat view cho UI */
export type CandidateSkill = {
  id: string;
  skillId: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
};

export type UpsertMySkillInput = {
  skillId: string;
  level: SkillLevel;
};

export type UpdateMySkillLevelInput = {
  level: SkillLevel;
};
