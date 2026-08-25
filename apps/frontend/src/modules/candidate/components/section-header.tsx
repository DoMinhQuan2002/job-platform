import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, icon, action, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/30 pb-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {icon ? <span className="text-primary">{icon}</span> : null}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}
