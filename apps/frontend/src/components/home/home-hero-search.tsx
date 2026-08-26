import Image from "next/image";
import { Banknote, ChevronDown, MapPin, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";

const filters = ["Ngành nghề", "Kinh nghiệm", "Hình thức làm việc", "Loại hình công việc"];

const controlClass = "h-14 w-full rounded-lg border border-border bg-white text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export function HomeHeroSearch() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] px-5 pb-32 pt-14 lg:px-6 lg:pt-16">
        <div className="relative z-10 mx-auto grid w-full container items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-10 tracking-[-0.01em] text-text sm:text-5xl sm:leading-[60px]">
              Tìm công việc phù hợp,<br />
              bứt phá <span className="text-primary">sự nghiệp</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-6 text-muted">
              Hàng ngàn cơ hội việc làm từ các công ty uy tín đang chờ đón bạn.
            </p>
          </div>

          <div className="relative hidden md:block">
            <Image
              className="ml-auto h-auto w-full max-w-lg rounded-xl object-cover shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpW4UsSSGgKllkxmrLQQwj1trOhc-PJum2oOdTQvR8a9D5-K2zjUC4Rkt87YkM_g2ytY8s64xDZYw23rUki1qPFtugJfhOD0bHRjXY4ngLfwoioOOMC8I1eLKC62aprt9iPs3g5dghvNzC8uWppMsLL11Tyk9MnUX_CZQDcA1dXovHVpZDD8sfo6rY980p5Fo5-5yNxOTh1QpX7p8H1gQITGY-2tc7wP0g2JD9S3CtSYU4TP43pNcblA"
              alt="Ứng viên chuyên nghiệp đang cầm máy tính bảng"
              width={512}
              height={340}
              priority
            />
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-20 px-5 lg:px-6">
        <form className="mx-auto w-full container rounded-xl bg-white p-5 shadow-[0_4px_15px_rgb(15_23_42/0.04)] sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SearchControl icon={<Search />}>
              <input
                className={`${controlClass} pl-10 pr-4`}
                aria-label="Từ khóa tìm kiếm"
                placeholder="VD: Kế toán, Marketing, IT, ..."
              />
            </SearchControl>

            <SearchControl icon={<MapPin />} chevron>
              <select className={`${controlClass} appearance-none pl-10 pr-10`} aria-label="Địa điểm">
                <option>Tất cả địa điểm</option>
                <option>Hà Nội</option>
                <option>TP. Hồ Chí Minh</option>
              </select>
            </SearchControl>

            <div className="flex min-w-0 gap-4">
              <SearchControl icon={<Banknote />} chevron className="min-w-0 flex-1">
                <select className={`${controlClass} appearance-none pl-10 pr-10`} aria-label="Mức lương">
                  <option>Tất cả mức lương</option>
                  <option>Dưới 10 triệu</option>
                  <option>10 - 20 triệu</option>
                </select>
              </SearchControl>
              <button type="submit" className="h-14 shrink-0 rounded-lg bg-primary px-8 text-sm font-semibold text-white transition hover:bg-primary-hover">
                Tìm kiếm
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
            <span className="flex items-center gap-2 text-sm font-medium text-muted">
              <SlidersHorizontal className="size-[18px]" /> Bộ lọc nâng cao
            </span>
            {filters.map((filter) => (
              <button key={filter} type="button" className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs text-text transition hover:bg-slate-50">
                {filter}<ChevronDown className="size-4" />
              </button>
            ))}
            <button type="reset" className="ml-auto flex items-center gap-1.5 text-xs text-muted transition hover:text-primary">
              <RefreshCcw className="size-4" /> Xóa bộ lọc
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function SearchControl({ icon, chevron, className = "", children }: { icon: React.ReactNode; chevron?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500 [&_svg]:size-5">{icon}</span>
      {children}
      {chevron && <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />}
    </label>
  );
}
