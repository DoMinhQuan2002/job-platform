import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type CompanyVerifiedBadgeProps = {
  className?: string;
};

export function CompanyVerifiedBadge({ className }: CompanyVerifiedBadgeProps) {
  return (
    <BadgeCheck
      className={cn("size-3.5 shrink-0 text-emerald-500", className)}
      aria-label="Công ty đã xác thực"
    />
  );
}
