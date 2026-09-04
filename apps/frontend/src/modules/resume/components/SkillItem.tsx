"use client";

import React from "react";
import { Award, X } from "lucide-react";
import { toast } from "sonner";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";
import { SKILL_LEVEL_SCORE, skillLevelLabel } from "../lib/skills";
import type { CandidateSkill, SkillCategory, SkillLevel } from "../types";

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

function deleteCopy(category: SkillCategory): { title: string; noun: string } {
  if (category === "LANGUAGE") {
    return { title: "Xóa ngoại ngữ?", noun: "ngoại ngữ" };
  }
  if (category === "CERTIFICATE") {
    return { title: "Xóa chứng chỉ?", noun: "chứng chỉ" };
  }
  return { title: "Xóa kỹ năng?", noun: "kỹ năng" };
}

export const SkillItem: React.FC<SkillItemProps> = ({ item, onRemove }) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const copy = deleteCopy(item.category);

  const handleConfirmRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove(item.id);
      toast.success(`Đã xóa ${copy.noun}!`);
    } catch {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsRemoving(false);
    }
  };

  const removeButton = (className: string, iconClassName: string) => (
    <button
      type="button"
      onClick={() => setConfirmOpen(true)}
      disabled={isRemoving}
      className={className}
      title="Xóa"
      aria-label={`Xóa ${copy.noun} ${item.name}`}
    >
      <X className={iconClassName} />
    </button>
  );

  const confirmDialog = (
    <AppAlertDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      tone="error"
      title={copy.title}
      description={
        <>
          Bạn sắp xóa {copy.noun}{" "}
          <span className="font-medium text-foreground">{item.name}</span>. Hành
          động này không thể hoàn tác.
        </>
      }
      cancelLabel="Hủy"
      confirmLabel="Xóa"
      onConfirm={handleConfirmRemove}
    />
  );

  if (item.category === "SKILL") {
    return (
      <>
        <div className="group relative rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-colors hover:border-gray-200 hover:bg-gray-100">
          {removeButton(
            "absolute top-2 right-2 p-1 text-gray-400 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 disabled:opacity-50",
            "h-3.5 w-3.5",
          )}
          <p className="mb-1 text-sm font-semibold text-foreground">{item.name}</p>
          <LevelDots level={item.level} />
        </div>
        {confirmDialog}
      </>
    );
  }

  if (item.category === "LANGUAGE") {
    return (
      <>
        <div className="group relative border-b border-gray-100 py-3 last:border-0">
          {removeButton(
            "absolute top-3 right-0 z-10 rounded-full bg-white p-1 text-gray-400 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 disabled:opacity-50",
            "h-4 w-4",
          )}
          <div className="mb-1 flex items-start justify-between pr-6">
            <p className="font-semibold text-foreground">{item.name}</p>
            <LevelDots level={item.level} />
          </div>
          <p className="text-sm text-muted-foreground">{skillLevelLabel(item.level)}</p>
        </div>
        {confirmDialog}
      </>
    );
  }

  return (
    <>
      <div className="group relative flex gap-4 border-b border-gray-100 py-3 last:border-0">
        {removeButton(
          "absolute top-3 right-0 z-10 rounded-full bg-white p-1 text-gray-400 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 disabled:opacity-50",
          "h-4 w-4",
        )}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
          <Award className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <div className="pr-6">
          <p className="mb-1 text-sm leading-tight font-semibold text-foreground">
            {item.name}
          </p>
          <p className="text-sm text-muted-foreground">{skillLevelLabel(item.level)}</p>
        </div>
      </div>
      {confirmDialog}
    </>
  );
};
