import type { CandidateProfile } from "../types";

export function calculateProfileCompletion(profile: CandidateProfile): number {
  const checks = [
    Boolean(profile.bio?.trim()),
    Boolean(profile.careerObjective?.trim()),
    profile.educations.length > 0,
    profile.workExperiences.length > 0,
    profile.skills.length > 0,
    profile.languages.length > 0,
    // profile.certificates.length > 0,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}
