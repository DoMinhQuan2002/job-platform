"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Shield,
  Briefcase,
  FileText,
  Send,
  Bookmark,
  Bell,
  Settings,
  Headphones,
  Camera,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { href: ROUTES.candidate.profile, label: "Tổng quan hồ sơ", icon: User },
  { href: ROUTES.candidate.profile, label: "Thông tin tài khoản", icon: Shield },
  { href: ROUTES.candidate.profile, label: "Hồ sơ nghề nghiệp", icon: Briefcase },
  { href: ROUTES.resume.root, label: "Quản lý CV", icon: FileText },
  { href: ROUTES.applications.root, label: "Đơn ứng tuyển", icon: Send },
  { href: ROUTES.applications.savedJobs, label: "Việc đã lưu", icon: Bookmark },
  { href: "/candidate/notifications", label: "Thông báo", icon: Bell, badge: 5 },
  { href: "/candidate/settings", label: "Cài đặt tài khoản", icon: Settings },
];

export function CandidateNavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full space-y-6">
      {/* 1. Profile Summary Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-center">
        {/* Avatar with edit button */}
        <div className="relative mx-auto h-20 w-20">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 bg-slate-100 p-0.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop"
              alt="Nguyễn Thị Mai"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <button
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm border border-slate-200 hover:text-primary transition"
            aria-label="Đổi ảnh đại diện"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <h3 className="mt-3 text-base font-bold text-slate-900">Nguyễn Thị Mai</h3>
        <p className="text-xs font-semibold text-primary">Ứng viên</p>

        {/* Profile completion bar */}
        <div className="mt-4 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Hồ sơ hoàn thiện:</span>
            <span className="text-primary font-bold">70%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: "70%" }}
            />
          </div>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xs space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/candidate" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-50/90 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Support Help Box */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary">
          <Headphones className="h-5 w-5" />
        </div>
        <h4 className="mt-3 text-sm font-bold text-slate-900">Bạn cần hỗ trợ?</h4>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.
        </p>
        <button className="mt-4 w-full rounded-xl border border-primary/40 bg-white py-2 text-xs font-semibold text-primary transition hover:bg-blue-50">
          Liên hệ hỗ trợ
        </button>
      </div>
    </aside>
  );
}
