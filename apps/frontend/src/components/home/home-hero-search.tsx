"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Banknote, MapPin, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { jobsApi } from "@/modules/jobs/api";
import type { JobCategory } from "@/modules/jobs/types";

const initialSearch = { keyword: "", location: "", categoryId: "", salary: "", maxExperience: "", jobMode: "", jobType: "" };

export function HomeHeroSearch() {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    jobsApi.listCategories(controller.signal).then((response) => setCategories(response.data)).catch(() => { if (!controller.signal.aborted) setCategories([]); }).finally(() => { if (!controller.signal.aborted) setCategoriesLoading(false); });
    return () => controller.abort();
  }, []);

  const update = (field: keyof typeof search, value: string) => setSearch((current) => ({ ...current, [field]: value }));
  const submit = () => {
    const query = new URLSearchParams();
    if (search.keyword.trim()) query.set("keyword", search.keyword.trim());
    if (search.location) query.set("location", search.location);
    if (search.categoryId) query.set("categoryId", search.categoryId);
    if (search.maxExperience) query.set("maxExperience", search.maxExperience);
    if (search.jobMode) query.set("jobMode", search.jobMode);
    if (search.jobType) query.set("jobType", search.jobType);
    if (search.salary) {
      const [minSalary, maxSalary] = search.salary.split(":");
      if (minSalary) query.set("minSalary", minSalary);
      if (maxSalary) query.set("maxSalary", maxSalary);
    }
    router.push(`/jobs${query.size ? `?${query.toString()}` : ""}`);
  };

  return <>
    <section className="relative overflow-hidden bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] pb-32 pt-14 lg:pt-16">
      <div className="relative z-10 mx-auto grid w-full container items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div><h1 className="text-4xl font-bold leading-10 tracking-[-0.01em] text-text sm:text-5xl sm:leading-[60px]">Tìm công việc phù hợp,<br />bứt phá <span className="text-primary">sự nghiệp</span></h1><p className="mt-6 max-w-md text-[15px] leading-6 text-muted">Hàng ngàn cơ hội việc làm từ các công ty uy tín đang chờ đón bạn.</p></div>
        <div className="relative hidden md:block"><Image className="ml-auto h-auto w-full max-w-lg rounded-xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpW4UsSSGgKllkxmrLQQwj1trOhc-PJum2oOdTQvR8a9D5-K2zjUC4Rkt87YkM_g2ytY8s64xDZYw23rUki1qPFtugJfhOD0bHRjXY4ngLfwoioOOMC8I1eLKC62aprt9iPs3g5dghvNzC8uWppMsLL11Tyk9MnUX_CZQDcA1dXovHVpZDD8sfo6rY980p5Fo5-5yNxOTh1QpX7p8H1gQITGY-2tc7wP0g2JD9S3CtSYU4TP43pNcblA" alt="Ứng viên chuyên nghiệp đang cầm máy tính bảng" width={512} height={340} priority /></div>
      </div>
    </section>

    <section className="relative z-20 mx-auto -mt-20 w-full container px-4 sm:px-6">
      <form className="w-full rounded-xl bg-white p-5 shadow-[0_4px_15px_rgb(15_23_42/0.04)] sm:p-6" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-slate-500" /><Input value={search.keyword} onChange={(event) => update("keyword", event.target.value)} className="h-14 pl-10" aria-label="Từ khóa tìm kiếm" placeholder="VD: Kế toán, Marketing, IT, ..." /></label>
          <label className="relative"><MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-slate-500" /><Select value={search.location} onChange={(event) => update("location", event.target.value)} className="h-14 pl-10"><option value="">Tất cả địa điểm</option><option value="Hà Nội">Hà Nội</option><option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option><option value="Đà Nẵng">Đà Nẵng</option></Select></label>
          <div className="flex min-w-0 gap-4"><label className="relative min-w-0 flex-1"><Banknote className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-slate-500" /><Select value={search.salary} onChange={(event) => update("salary", event.target.value)} className="h-14 pl-10"><option value="">Tất cả mức lương</option><option value=":10000000">Dưới 10 triệu</option><option value="10000000:20000000">10 - 20 triệu</option><option value="20000000:30000000">20 - 30 triệu</option><option value="30000000:">Trên 30 triệu</option></Select></label><Button type="submit" className="h-14 px-8">Tìm kiếm</Button></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <span className="flex items-center gap-2 text-sm font-medium text-muted"><SlidersHorizontal className="size-[18px]" /> Bộ lọc nâng cao</span>
          <Select value={search.categoryId} disabled={categoriesLoading} onChange={(event) => update("categoryId", event.target.value)} className="w-auto min-w-40"><option value="">{categoriesLoading ? "Đang tải ngành nghề..." : "Ngành nghề"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
          <Select value={search.maxExperience} onChange={(event) => update("maxExperience", event.target.value)} className="w-auto min-w-36"><option value="">Kinh nghiệm</option><option value="0">Không yêu cầu</option><option value="1">Dưới 1 năm</option><option value="3">Dưới 3 năm</option><option value="5">Dưới 5 năm</option></Select>
          <Select value={search.jobMode} onChange={(event) => update("jobMode", event.target.value)} className="w-auto min-w-44"><option value="">Hình thức làm việc</option><option value="ONSITE">Tại văn phòng</option><option value="REMOTE">Làm từ xa</option><option value="HYBRID">Kết hợp</option></Select>
          <Select value={search.jobType} onChange={(event) => update("jobType", event.target.value)} className="w-auto min-w-44"><option value="">Loại hình công việc</option><option value="FULL_TIME">Full-time</option><option value="PART_TIME">Part-time</option></Select>
          <button type="button" onClick={() => setSearch(initialSearch)} className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-primary"><RefreshCcw className="size-4" /> Xóa bộ lọc</button>
        </div>
      </form>
    </section>
  </>;
}
