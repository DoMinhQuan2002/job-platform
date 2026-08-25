import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const navItems = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.jobs, label: "Jobs" },
  { href: ROUTES.candidate.root, label: "Candidate" },
  { href: ROUTES.resume.root, label: "Resume" },
  { href: ROUTES.applications.root, label: "Applications" },
  { href: ROUTES.recruiter.root, label: "Recruiter" },
  { href: ROUTES.login, label: "Login" },
];

export function MainNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <p className="mr-4 text-sm font-semibold text-primary">Job Platform</p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
