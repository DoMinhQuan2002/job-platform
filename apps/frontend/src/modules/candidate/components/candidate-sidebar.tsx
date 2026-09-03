"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  FileText,
  Headphones,
  LayoutDashboard,
  Send,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { calculateProfileCompletion } from "../lib/completion";
import type { CandidateProfile } from "../types";
import { ProfileCard } from "./profile-card";
import { ProgressBar } from "./progress-bar";

type CandidateSidebarProps = {
  profile: CandidateProfile | null;
  displayName?: string;
  avatarUrl?: string | null;
};

const navItems = [
  { href: ROUTES.candidate.profile, label: "Tổng quan hồ sơ", icon: LayoutDashboard },
  { href: ROUTES.resume.root, label: "Quản lý CV", icon: FileText },
  { href: ROUTES.applications.root, label: "Đơn ứng tuyển", icon: Send },
  { href: ROUTES.applications.savedJobs, label: "Việc đã lưu", icon: Bookmark },
  { href: "#", label: "Thông báo", icon: Bell, badge: 5, disabled: true },
  { href: "#", label: "Cài đặt tài khoản", icon: Settings, divider: true },
];

function isNavActive(pathname: string, href: string, label: string): boolean {
  if (href === ROUTES.candidate.profile) {
    return label === "Tổng quan hồ sơ" && pathname.startsWith(ROUTES.candidate.profile);
  }
  if (href === ROUTES.applications.root) {
    return (
      pathname === ROUTES.applications.root ||
      /^\/candidate\/applications\/[^/]+$/.test(pathname)
    );
  }
  if (href === ROUTES.applications.savedJobs) {
    return pathname.startsWith(ROUTES.applications.savedJobs);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CandidateSidebar({
  profile,
  displayName = "Ứng viên",
  avatarUrl,
}: CandidateSidebarProps) {
  const pathname = usePathname();
  const completion = profile ? calculateProfileCompletion(profile) : 0;
  const name = displayName?.trim() || "Ứng viên";

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
      <ProfileCard className="flex flex-col items-center px-6 pb-6 pt-6 text-center">
        <div className="relative mb-4">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#f2f3fc] shadow-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="size-full object-cover" />
            ) : (
              <User className="size-10 text-muted-foreground" />
            )}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-xs font-semibold text-[#0045b2]">Ứng viên</p>
        <div className="mt-4 w-full space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>Hồ sơ hoàn thiện:</span>
            <span className="text-[#0045b2]">{completion}%</span>
          </div>
          <ProgressBar value={completion} />
        </div>
      </ProfileCard>

      <ProfileCard className="p-0">
        <nav className="py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.disabled && isNavActive(pathname, item.href, item.label);

            const content = (
              <span
                className={cn(
                  "flex items-center justify-between gap-3 border-l-4 px-6 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#0045b2] bg-[rgba(179,197,255,0.2)] text-[#0045b2]"
                    : "border-transparent text-muted hover:bg-muted/30",
                  item.disabled && "pointer-events-none opacity-60",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </span>
            );

            return (
              <div key={item.label}>
                {item.divider ? <div className="my-1 border-t border-border/50" /> : null}
                {item.disabled ? content : <Link href={item.href}>{content}</Link>}
              </div>
            );
          })}
        </nav>
      </ProfileCard>

      <ProfileCard className="space-y-4">
        <div className="flex items-center gap-3">
          <Headphones className="size-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Bạn cần hỗ trợ?</h3>
        </div>
        <p className="text-sm leading-5 text-muted">
          Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.
        </p>
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
          Liên hệ hỗ trợ
        </Button>
      </ProfileCard>
    </aside>
  );
}
