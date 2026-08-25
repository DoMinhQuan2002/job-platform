import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ProfileCardProps = {
  children: ReactNode;
  className?: string;
};

export function ProfileCard({ children, className }: ProfileCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/30 bg-white p-6 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
