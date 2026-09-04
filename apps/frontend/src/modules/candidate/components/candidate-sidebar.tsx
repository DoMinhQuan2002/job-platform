"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  Bell,
  Bookmark,
  Camera,
  FileText,
  Headphones,
  LayoutDashboard,
  Loader2,
  Send,
  Settings,
  Trash2,
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
  avatarUploading?: boolean;
  onAvatarSelect?: (file: File) => void;
  onAvatarRemove?: () => void;
};

const navItems = [
  { href: ROUTES.candidate.profile, label: "Tổng quan hồ sơ", icon: LayoutDashboard },
  { href: ROUTES.resume.root, label: "Quản lý CV", icon: FileText },
  { href: ROUTES.applications.root, label: "Đơn ứng tuyển", icon: Send },
  { href: ROUTES.applications.savedJobs, label: "Việc đã lưu", icon: Bookmark },
  { href: "#", label: "Thông báo", icon: Bell, badge: 5, disabled: true },
  { href: "#", label: "Cài đặt tài khoản", icon: Settings, divider: true },
];

const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

function isNavActive(pathname: string, href: string, label: string): boolean {
  if (href === ROUTES.candidate.profile) {
    return label === "Tổng quan hồ sơ" && pathname.startsWith(ROUTES.candidate.profile);
  }
  if (href === ROUTES.applications.savedJobs) {
    return pathname.startsWith(ROUTES.applications.savedJobs);
  }
  if (href === ROUTES.applications.root) {
    return (
      pathname.startsWith(ROUTES.applications.root) &&
      !pathname.startsWith(ROUTES.applications.savedJobs)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CandidateSidebar({
  profile,
  displayName = "Ứng viên",
  avatarUrl,
  avatarUploading = false,
  onAvatarSelect,
  onAvatarRemove,
}: CandidateSidebarProps) {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completion = profile ? calculateProfileCompletion(profile) : 0;
  const name = displayName?.trim() || "Ứng viên";
  const canEditAvatar = Boolean(onAvatarSelect);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[280px]">
      <ProfileCard className="flex flex-col items-center px-6 pb-6 pt-6 text-center">
        <div className="relative mb-4 size-24 shrink-0">
          <div className="size-full overflow-hidden rounded-full bg-[#f2f3fc] ring-4 ring-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                width={96}
                height={96}
                decoding="async"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <User className="size-10 text-muted-foreground" />
              </div>
            )}
            {avatarUploading ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="size-6 animate-spin text-white" />
              </div>
            ) : null}
          </div>

          {canEditAvatar ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={AVATAR_ACCEPT}
                className="sr-only"
                disabled={avatarUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) onAvatarSelect?.(file);
                }}
              />
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Đổi ảnh đại diện"
                className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full border border-[#c5cbe0] bg-white text-[#0045b2] shadow-[0_1px_3px_rgba(0,69,178,0.12)] transition hover:bg-[#f5f7ff] disabled:opacity-60"
              >
                <Camera className="size-4" strokeWidth={1.75} absoluteStrokeWidth />
              </button>
              {avatarUrl && onAvatarRemove ? (
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={onAvatarRemove}
                  aria-label="Xóa ảnh đại diện"
                  className="absolute -bottom-0.5 -left-0.5 flex size-8 items-center justify-center rounded-full border border-[#c5cbe0] bg-white text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:border-destructive/40 hover:text-destructive disabled:opacity-60"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} absoluteStrokeWidth />
                </button>
              ) : null}
            </>
          ) : null}
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
        <Button
          type="button"
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/5"
          onClick={() => {
            const newsletter = document.getElementById("footer-newsletter");
            newsletter?.scrollIntoView({ behavior: "smooth", block: "center" });
            window.setTimeout(() => {
              document.getElementById("footer-email")?.focus();
            }, 400);
          }}
        >
          Liên hệ hỗ trợ
        </Button>
      </ProfileCard>
    </aside>
  );
}
