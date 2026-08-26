import Link from "next/link";
import { Award, Languages, Plus, Wrench } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { CandidateSkill } from "../types";
import { levelLabel, RatingDots } from "./rating-dots";
import { ProfileCard } from "./profile-card";
import { SectionHeader } from "./section-header";

type SkillsOverviewProps = {
  skills: CandidateSkill[];
  languages: CandidateSkill[];
  certificates: CandidateSkill[];
};

function SkillColumn({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: CandidateSkill[];
  emptyText: string;
}) {
  return (
    <ProfileCard className="flex-1 space-y-4">
      <SectionHeader
        title={title}
        icon={icon}
        action={
          <Link
            href={ROUTES.resume.root}
            className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <Plus className="size-3.5" />
            Thêm
          </Link>
        }
        className="pb-3"
      />
      {items.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-[#f9f9ff] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.skill.name}</p>
                {item.skill.description ? (
                  <p className="truncate text-xs text-muted">{item.skill.description}</p>
                ) : (
                  <p className="text-xs text-muted">{levelLabel(item.level)}</p>
                )}
              </div>
              <RatingDots level={item.level} />
            </li>
          ))}
        </ul>
      )}
    </ProfileCard>
  );
}

export function SkillsOverview({ skills, languages, certificates }: SkillsOverviewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <SkillColumn
        title="Kỹ năng"
        icon={<Wrench className="size-5" />}
        items={skills}
        emptyText="Chưa có kỹ năng. Quản lý tại mục CV."
      />
      <SkillColumn
        title="Ngoại ngữ"
        icon={<Languages className="size-5" />}
        items={languages}
        emptyText="Chưa có ngoại ngữ."
      />
      <SkillColumn
        title="Chứng chỉ"
        icon={<Award className="size-5" />}
        items={certificates}
        emptyText="Chưa có chứng chỉ."
      />
    </div>
  );
}
