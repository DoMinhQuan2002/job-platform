import type { LucideIcon } from "lucide-react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "purple" | "warning";
};

const tones = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  purple: "bg-purple/10 text-purple",
  warning: "bg-warning/10 text-warning",
};

export function DashboardCard({ label, value, detail, icon: Icon, tone = "primary" }: DashboardCardProps) {
  return (
    <article className="flex min-h-28 items-start gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-full", tones[tone])}><Icon className="size-5" /></div>
      <div>
        <p className="mb-1 text-sm font-medium text-muted">{label}</p>
        <strong className="text-2xl text-text">{value}</strong>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted"><span className="flex items-center font-medium text-success"><ArrowUp className="size-3" /> {detail.split(" ")[0]}</span> {detail.substring(detail.indexOf(" ") + 1)}</p>
      </div>
    </article>
  );
}
