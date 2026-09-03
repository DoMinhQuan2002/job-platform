export type Education = {
  id: string;
  candidateId: string;
  school: string;
  major: string | null;
  degree: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkExperience = {
  id: string;
  candidateId: string;
  companyName: string;
  position: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | "NATIVE";

export type SkillCatalog = {
  id: string;
  name: string;
  category: "SKILL" | "LANGUAGE" | "CERTIFICATE";
  code: string | null;
  description: string | null;
  status: string;
};

export type CandidateSkill = {
  id: string;
  candidateId: string;
  skillId: string;
  level: SkillLevel;
  skill: SkillCatalog;
};

export type CandidateProfile = {
  id: string;
  userId: string;
  bio: string | null;
  careerObjective: string | null;
  educations: Education[];
  workExperiences: WorkExperience[];
  skills: CandidateSkill[];
  languages: CandidateSkill[];
  createdAt: string;
  updatedAt: string;
};

/** Shape G1 `GET /users/me` — contract: trang hồ sơ gọi cả G1 + G3 */
export type AccountUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  dateOfBirth: string | null;
  addressDetail: string | null;
  wardCode: string | null;
  hasPassword?: boolean;
};

export type UpdateAccountInput = {
  fullName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  addressDetail?: string | null;
  wardCode?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateCandidateProfileInput = {
  bio?: string | null;
  careerObjective?: string | null;
};

export type EducationFormInput = {
  school: string;
  major?: string | null;
  degree?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
};

export type WorkExperienceFormInput = {
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
};
