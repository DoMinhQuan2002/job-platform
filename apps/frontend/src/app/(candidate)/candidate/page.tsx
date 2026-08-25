import Link from "next/link";
import { PageSection } from "@/components/layout/page-section";
import { ROUTES } from "@/constants/routes";

const modules = [
  {
    href: ROUTES.candidate.profile,
    folder: "modules/candidate",
    owner: "Bình",
    label: "Hồ sơ (bio / học vấn / kinh nghiệm)",
  },
  {
    href: ROUTES.resume.root,
    folder: "modules/resume",
    owner: "Lợi",
    label: "CV & kỹ năng",
  },
  {
    href: ROUTES.applications.root,
    folder: "modules/applications",
    owner: "Mạnh",
    label: "Đơn ứng tuyển & việc đã lưu",
  },
] as const;

export default function CandidateHubPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PageSection
        title="Candidate — Group 3"
        description="Mỗi người chỉ code trong 1 folder module. Route app/ chỉ re-export, không viết logic ở đó."
      />

      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {modules.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">Owner: {item.owner}</p>
              <p className="mt-1 font-mono text-xs text-slate-400">src/{item.folder}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
