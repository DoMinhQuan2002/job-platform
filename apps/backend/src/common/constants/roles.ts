export const ROLES = {
  CANDIDATE: "CANDIDATE",
  RECRUITER: "RECRUITER",
  ADMIN: "ADMIN",
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];
