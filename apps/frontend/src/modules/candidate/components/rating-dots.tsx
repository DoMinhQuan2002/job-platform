import { cn } from "@/lib/utils";
import type { SkillLevel } from "../types";

const LEVEL_SCORE: Record<SkillLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
  NATIVE: 5,
};

type RatingDotsProps = {
  level: SkillLevel;
  max?: number;
  className?: string;
};

export function RatingDots({ level, max = 5, className }: RatingDotsProps) {
  const score = LEVEL_SCORE[level] ?? 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-2 rounded-full",
            index < score ? "bg-primary" : "bg-[#ecedf6]",
          )}
        />
      ))}
    </div>
  );
}

export function levelLabel(level: SkillLevel): string {
  const labels: Record<SkillLevel, string> = {
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung bình",
    ADVANCED: "Khá",
    EXPERT: "Giỏi",
    NATIVE: "Bản ngữ",
  };
  return labels[level];
}
