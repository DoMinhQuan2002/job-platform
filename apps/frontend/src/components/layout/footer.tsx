"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import Image from "next/image";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppAlertDialog } from "@/components/ui/app-alert-dialog";

const candidateLinks = [
  ["Tìm việc làm", ROUTES.jobs],
  ["Việc làm đã lưu", ROUTES.applications.savedJobs],
  ["Ứng tuyển của tôi", ROUTES.applications.root],
  ["Tạo CV", ROUTES.resume.root],
  ["Hồ sơ của tôi", ROUTES.candidate.profile],
  ["Tài khoản", ROUTES.candidate.account],
];

const employerLinks = [
  ["Đăng tin tuyển dụng", ROUTES.recruiter.root],
  ["Quản lý tin tuyển dụng", ROUTES.recruiter.root],
  ["Quản lý ứng viên", ROUTES.recruiter.root],
  ["Tìm hồ sơ ứng viên", ROUTES.recruiter.root],
  // ["Bảng giá dịch vụ", "/pricing"],
];

// const companyLinks = [
//   ["Giới thiệu công ty", "/about"],
//   ["Tin tức", "/news"],
//   ["Sự kiện", "/events"],
//   ["Tuyển dụng nội bộ", "/careers"],
//   ["Liên hệ", "#footer-contact"],
// ];

function FooterLinks({
  title,
  links,
  onLinkClick,
}: {
  title: string;
  links: string[][];
  onLinkClick?: (
    e: React.MouseEvent<HTMLAnchorElement>,
    label: string,
    href: string,
  ) => void;
}) {
  return (
    <section>
      <h2 className="mb-6 text-sm font-bold text-slate-900">{title}</h2>
      <ul className="space-y-4 text-xs text-slate-600">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              className="transition-colors hover:text-primary"
              href={href}
              onClick={(e) => onLinkClick?.(e, label, href)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Footer() {
  const router = useRouter();
  const { isRecruiter, isCandidate } = useAuthSession();
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    targetFeature: string;
    targetRoleText: string;
    currentRoleText: string;
    promptText: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    targetFeature: "",
    targetRoleText: "",
    currentRoleText: "",
    promptText: "",
    confirmLabel: "",
    onConfirm: () => {},
  });

  const handleCandidateLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    label: string,
    href: string,
  ) => {
    if (isRecruiter && href !== ROUTES.jobs) {
      e.preventDefault();
      setNotice({
        open: true,
        title: "Dành cho ứng viên",
        targetFeature: label,
        targetRoleText: "Ứng viên (người tìm việc)",
        currentRoleText: "Nhà tuyển dụng",
        promptText: "Bạn có muốn chuyển đến trang quản lý Nhà tuyển dụng không?",
        confirmLabel: "Đến trang Nhà tuyển dụng",
        onConfirm: () => router.push(ROUTES.recruiter.root),
      });
    }
  };

  const handleEmployerLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    label: string,
  ) => {
    if (isCandidate) {
      e.preventDefault();
      setNotice({
        open: true,
        title: "Dành cho nhà tuyển dụng",
        targetFeature: label,
        targetRoleText: "Nhà tuyển dụng (doanh nghiệp)",
        currentRoleText: "Ứng viên",
        promptText: "Bạn có muốn chuyển đến trang thông tin Ứng viên không?",
        confirmLabel: "Đến trang Ứng viên",
        onConfirm: () => router.push(ROUTES.candidate.profile),
      });
    }
  };
  return (
    <footer className="border-t border-slate-200 bg-[#f7f8ff] text-slate-700">
      <div className="mx-auto w-full container px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1.1fr_1.15fr] lg:gap-12">
          <section>
            <Link
              href={ROUTES.home}
              className="flex items-center gap-2"
              aria-label="JobPlatform - Trang chủ"
            >
              <Image
                src="/logo.png"
                alt="JobPlatform"
                width={40}
                height={40}
                priority
              />
              <span className="text-base font-bold text-slate-900">
                Job Platform
              </span>
            </Link>
            <p className="mt-7 max-w-47.5 text-xs leading-5 text-slate-600">
              JobPlatform là nền tảng tuyển dụng kết nối ứng viên và doanh
              nghiệp một cách nhanh chóng và hiệu quả.
            </p>
            {/* <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Facebook",
                  icon: <span className="text-sm font-bold">f</span>,
                },
                { label: "Chia sẻ", icon: <Share2 /> },
                { label: "YouTube", icon: <PlayCircle /> },
                { label: "TikTok", icon: <Music2 /> },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="grid size-7 place-items-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-primary hover:text-white [&_svg]:size-4"
                >
                  {social.icon}
                </a>
              ))}
            </div> */}
          </section>

          <FooterLinks
            title="Dành cho ứng viên"
            links={candidateLinks}
            onLinkClick={handleCandidateLinkClick}
          />
          <FooterLinks
            title="Dành cho doanh nghiệp"
            links={employerLinks}
            onLinkClick={handleEmployerLinkClick}
          />
          {/* <FooterLinks title="Về JobPlatform" links={companyLinks} /> */}

          <section id="footer-contact" className="scroll-mt-24">
            <h2 className="mb-6 text-sm font-bold text-slate-900">
              Liên hệ với chúng tôi
            </h2>
            <ul className="space-y-4 text-xs leading-5 text-slate-600">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Tòa nhà An Phú, Lê Trọng Tấn, Dương Nội, Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href="tel:02473008888">024 7300 8888</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href="mailto:support@jobplatform.vn">
                  support@jobplatform.vn
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Thứ 2 - Thứ 6: 8:00 - 17:30</span>
              </li>
            </ul>
          </section>
        </div>

        <section
          id="footer-newsletter"
          className="mt-12 flex scroll-mt-24 flex-col gap-5 rounded-xl bg-[#e8eaf2] p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Nhận thông tin việc làm mới nhất
              </h2>
              <p className="mt-1 text-[11px] text-slate-600">
                Đăng ký để nhận các cơ hội việc làm phù hợp với bạn.
              </p>
            </div>
          </div>
          {/*
            Chưa có API newsletter ở BE -> khoá form lại thay vì để user gõ email
            rồi không có gì xảy ra. Khi nào có POST /api/v1/newsletter/subscribe
            thì bỏ disabled và thêm onSubmit (nhớ thêm "use client" cho file này).
          */}
          <form
            className="flex w-full flex-col gap-2 sm:flex-row md:max-w-[460px]"
            action="#"
          >
            <label className="sr-only" htmlFor="footer-email">
              Email của bạn
            </label>
            <input
              id="footer-email"
              type="email"
              disabled
              placeholder="Tính năng đang được phát triển"
              className="h-11 min-w-0 flex-1 cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 text-xs text-slate-400 outline-none"
            />
            <button
              type="submit"
              disabled
              className="h-11 cursor-not-allowed rounded-lg bg-slate-400 px-6 text-sm font-semibold text-white"
            >
              Sắp ra mắt
            </button>
          </form>
        </section>

        <div className="mt-11 grid gap-6 border-t border-slate-300 pt-8 text-[11px] text-slate-600 lg:grid-cols-[1fr_1fr] lg:items-center">
          <p>
            © {new Date().getFullYear()} JobPlatform. Tất cả quyền được bảo lưu.
          </p>
          {/* <nav
            className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 lg:justify-center"
            aria-label="Chính sách"
          >
            <Link href="/terms" className="hover:text-primary">
              Điều khoản sử dụng
            </Link>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <Link href="/privacy" className="hover:text-primary">
              Chính sách bảo mật
            </Link>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <Link href="/cookies" className="hover:text-primary">
              Chính sách Cookie
            </Link>
          </nav> */}
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <ShieldCheck className="size-5" />
            <span className="mr-2  leading-4 ">
              Bảo mật thông tin
            </span>
          </div>
        </div>
      </div>

      <AppAlertDialog
        open={notice.open}
        onOpenChange={(open) => setNotice((prev) => ({ ...prev, open }))}
        title={notice.title}
        tone="info"
        description={
          <div className="space-y-2">
            <p>
              Tính năng{" "}
              <strong className="font-semibold text-slate-900">
                {notice.targetFeature ? `"${notice.targetFeature}"` : "này"}
              </strong>{" "}
              chỉ dành cho tài khoản {notice.targetRoleText}.
            </p>
            <p>
              Bạn hiện đang đăng nhập với vai trò{" "}
              <strong className="font-semibold text-primary">
                {notice.currentRoleText}
              </strong>
              . {notice.promptText}
            </p>
          </div>
        }
        confirmLabel={notice.confirmLabel}
        cancelLabel="Đóng"
        onConfirm={notice.onConfirm}
      />
    </footer>
  );
}
