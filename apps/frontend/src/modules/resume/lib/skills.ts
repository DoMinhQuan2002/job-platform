import type { AggregateSkillItem, CandidateSkill, SkillLevel } from "../types";

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "BEGINNER", label: "Cơ bản" },
  { value: "INTERMEDIATE", label: "Trung bình" },
  { value: "ADVANCED", label: "Khá" },
  { value: "EXPERT", label: "Thành thạo" },
  { value: "NATIVE", label: "Bản ngữ" },
];

export const SKILL_LEVEL_SCORE: Record<SkillLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
  NATIVE: 5,
};

export function skillLevelLabel(level: SkillLevel): string {
  return SKILL_LEVELS.find((item) => item.value === level)?.label ?? level;
}

export function normalizeCandidateSkill(item: AggregateSkillItem): CandidateSkill {
  return {
    id: item.id,
    skillId: item.skillId,
    name: item.skill.name,
    category: item.skill.category,
    level: item.level,
  };
}
