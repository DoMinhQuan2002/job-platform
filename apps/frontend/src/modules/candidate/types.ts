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

/** Skills trong GET /candidates/me — UI edit thuộc module resume (Lợi). */
export type CandidateProfileSkill = {
  id: string;
  skillId: string;
  name: string;
  category: "SKILL" | "LANGUAGE" | "CERTIFICATE";
  level: string | null;
};

export type CandidateProfile = {
  id: string;
  userId: string;
  bio: string | null;
  careerObjective: string | null;
  educations: Education[];
  workExperiences: WorkExperience[];
  skills: CandidateProfileSkill[];
};

export type UpdateCandidateProfileInput = {
  bio?: string | null;
  careerObjective?: string | null;
};
