"use client";

import React from "react";
import { X, Award } from "lucide-react";
import { toast } from "sonner";
import { SKILL_LEVEL_SCORE, skillLevelLabel } from "../lib/skills";
import type { CandidateSkill, SkillLevel } from "../types";

interface SkillItemProps {
  item: CandidateSkill;
  onRemove: (id: string) => Promise<void>;
}

function LevelDots({ level }: { level: SkillLevel }) {
  const score = SKILL_LEVEL_SCORE[level] ?? 0;
  return (
    <div className="mt-1 flex gap-1" title={skillLevelLabel(level)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full ${i <= score ? "bg-primary" : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}

export const SkillItem: React.FC<SkillItemProps> = ({ item, onRemove }) => {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove(item.id);
      toast.success("Đã xóa kỹ năng!");
    } catch {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsRemoving(false);
    }
  };

  if (item.category === "SKILL") {
    return (
      <div className="group relative rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-colors hover:border-gray-200 hover:bg-gray-100">
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          title="Xóa"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <p className="mb-1 text-sm font-semibold text-foreground">{item.name}</p>
        <LevelDots level={item.level} />
      </div>
    );
  }

  if (item.category === "LANGUAGE") {
    return (
      <div className="group relative border-b border-gray-100 py-3 last:border-0">
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-3 right-0 z-10 rounded-full bg-white p-1 text-gray-400 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          title="Xóa"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-1 flex items-start justify-between pr-6">
          <p className="font-semibold text-foreground">{item.name}</p>
          <LevelDots level={item.level} />
        </div>
        <p className="text-sm text-muted-foreground">{skillLevelLabel(item.level)}</p>
      </div>
    );
  }

  return (
    <div className="group relative flex gap-4 border-b border-gray-100 py-3 last:border-0">
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="absolute top-3 right-0 z-10 rounded-full bg-white p-1 text-gray-400 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        title="Xóa"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
        <Award className="h-5 w-5 text-primary" strokeWidth={2} />
      </div>
      <div className="pr-6">
        <p className="mb-1 text-sm leading-tight font-semibold text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">{skillLevelLabel(item.level)}</p>
      </div>
    </div>
  );
};
