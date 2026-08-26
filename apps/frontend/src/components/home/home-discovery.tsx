import Link from "next/link";
import { ArrowRight, BadgeCheck, Bookmark, ChevronRight, Mail, MapPin } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const companies = [
  { name: "FPT Software", jobs: 120, mark: "FPT", color: "text-[#f36f21]", verified: false },
  { name: "Vietcombank", jobs: 85, mark: "VCB", color: "text-[#005a3c]", verified: true },
  { name: "Shopee", jobs: 78, mark: "S", color: "bg-[#ee4d2d] text-white", verified: false },
  { name: "VNG Corporation", jobs: 65, mark: "VNG", color: "text-[#f58220]", verified: true },
  { name: "MoMo", jobs: 45, mark: "momo", color: "bg-[#a50064] text-white", verified: true },
];

const jobs = [
  { company: "FPT Software", mark: "FPT", logo: "text-[#f36f21]", title: "Frontend Developer (ReactJS)", location: "Hà Nội", salary: "20 - 30 triệu", experience: "2 - 4 năm", tags: ["ReactJS", "TypeScript", "JavaScript"], time: "2 giờ trước" },
  { company: "Vietcombank", mark: "VCB", logo: "text-[#005a3c]", title: "Chuyên viên Khách hàng cá nhân", location: "Hà Nội", salary: "15 - 25 triệu", experience: "1 - 2 năm", tags: ["Tài chính", "Giao tiếp", "Tư vấn"], time: "3 giờ trước" },
  { company: "Shopee", mark: "S", logo: "bg-[#ee4d2d] text-white", title: "Product Manager", location: "TP. Hồ Chí Minh", salary: "30 - 50 triệu", experience: "3 - 5 năm", tags: ["Product", "Agile", "Analytics"], time: "5 giờ trước" },
  { company: "MoMo", mark: "momo", logo: "bg-[#a50064] text-white", title: "Business Analyst", location: "TP. Hồ Chí Minh", salary: "20 - 35 triệu", experience: "2 - 4 năm", tags: ["SQL", "Excel", "Phân tích dữ liệu"], time: "1 ngày trước" },
];

export function HomeDiscovery() {
  return <>
    <section className="px-5 py-16 lg:px-6"><div className="mx-auto container">
      <SectionHeading title="Công ty nổi bật" href="/companies" />
      <div className="flex snap-x gap-4 overflow-x-auto pb-4">
        {companies.map((company) => <Link href="/companies" key={company.name} className="flex min-w-[220px] flex-1 snap-start items-center gap-4 rounded-xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid size-12 shrink-0 place-items-center rounded border border-border text-xs font-bold ${company.color}`}>{company.mark}</span><span><span className="flex items-center gap-1 text-sm font-semibold text-text">{company.name}{company.verified && <BadgeCheck className="size-4 text-primary" />}</span><small className="mt-1 block text-xs text-muted">{company.jobs} việc làm</small></span></Link>)}
        <button type="button" aria-label="Xem thêm công ty" className="grid size-12 shrink-0 self-center place-items-center rounded-full border border-border bg-white hover:bg-slate-50"><ChevronRight className="size-5" /></button>
      </div>
    </div></section>

    <section className="bg-slate-50 px-5 pb-16 pt-10 lg:px-6"><div className="mx-auto container">
      <SectionHeading title="Việc làm mới nhất" href={ROUTES.jobs} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {jobs.map((job) => <article key={job.title} className="group relative flex min-h-[290px] flex-col rounded-xl border border-border bg-white p-5 transition hover:border-primary hover:shadow-md">
          <span className="absolute right-4 top-4 rounded bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">Mới</span>
          <div className="mb-4 flex items-center gap-2"><span className={`grid size-8 place-items-center rounded border border-border text-[9px] font-bold ${job.logo}`}>{job.mark}</span><span className="flex items-center gap-1 text-[11px] font-semibold text-muted">{job.company}<BadgeCheck className="size-3.5 text-primary" /></span></div>
          <h3 className="mb-3 pr-2 text-base font-bold leading-6 text-text transition group-hover:text-primary">{job.title}</h3>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-muted"><span className="flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span><i className="size-1 rounded-full bg-slate-300" /><strong className="text-primary">{job.salary}</strong><i className="size-1 rounded-full bg-slate-300" /><span>{job.experience}</span></div>
          <div className="mb-5 flex flex-wrap gap-2">{job.tags.map((tag) => <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-[10px] text-muted">{tag}</span>)}</div>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-4"><span className="text-[10px] text-slate-500">{job.time}</span><button aria-label={`Lưu việc làm ${job.title}`} className="text-slate-500 hover:text-primary"><Bookmark className="size-5" /></button></div>
        </article>)}
      </div>
    </div></section>

    <section className="px-5 py-12 lg:px-6"><div className="mx-auto flex container flex-col items-center justify-between gap-8 rounded-2xl border border-primary/10 bg-primary/5 p-7 md:flex-row">
      <div className="flex items-center gap-5"><span className="relative grid size-20 shrink-0 place-items-center text-primary"><Mail className="size-16 stroke-[1.3]" /><i className="absolute right-1 top-0 size-3 rounded-full bg-amber-400" /></span><span><h2 className="text-xl font-bold text-text sm:text-2xl">Nhận việc làm phù hợp qua email</h2><p className="mt-2 text-sm text-muted">Đăng ký để nhận việc làm mới nhất và gợi ý phù hợp với bạn.</p></span></div>
      <form className="flex w-full max-w-md flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="home-email">Email của bạn</label><input id="home-email" required type="email" placeholder="Nhập email của bạn" className="h-12 min-w-0 flex-1 rounded-lg border border-border bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /><button className="h-12 rounded-lg bg-primary px-6 text-sm font-semibold whitespace-nowrap text-white hover:bg-primary-hover">Đăng ký ngay</button></form>
    </div></section>
  </>;
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return <div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-text sm:text-2xl">{title}</h2><Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">Xem tất cả<ArrowRight className="size-4" /></Link></div>;
}
