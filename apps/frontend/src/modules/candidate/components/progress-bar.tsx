import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-[#ecedf6]", className)}>
      <div
        className="h-full rounded-full bg-[#0045b2] transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
