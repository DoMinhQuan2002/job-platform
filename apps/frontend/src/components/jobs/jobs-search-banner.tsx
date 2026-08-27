"use client";

import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { JobCategory } from "@/modules/jobs/types";

type Props = { keyword: string; location: string; categoryId: string; categories: JobCategory[]; categoriesLoading: boolean; onChange: (field: string, value: string) => void; onSubmit: () => void };

export function JobsSearchBanner({ keyword, location, categoryId, categories, categoriesLoading, onChange, onSubmit }: Props) {
  return <section className="relative mb-6 overflow-hidden rounded-xl bg-slate-100 p-5 sm:p-7">
    <div className="relative z-10"><h1 className="mb-5 text-2xl font-bold text-text sm:text-3xl">Tìm việc phù hợp với bạn</h1>
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_190px_190px_auto]" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <label className="relative"><span className="sr-only">Tên công việc hoặc kỹ năng</span><Search className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted" /><Input value={keyword} onChange={(event) => onChange("keyword", event.target.value)} className="h-11 bg-white pl-9" placeholder="Nhập tên công việc, kỹ năng..." /></label>
        <label className="relative"><span className="sr-only">Địa điểm</span><MapPin className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted" /><Select value={location} onChange={(event) => onChange("location", event.target.value)} className="h-11 pl-9"><option value="">Địa điểm làm việc</option><option value="Hà Nội">Hà Nội</option><option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option><option value="Đà Nẵng">Đà Nẵng</option><option value="Cần Thơ">Cần Thơ</option></Select></label>
        <Select value={categoryId} disabled={categoriesLoading} onChange={(event) => onChange("categoryId", event.target.value)} className="h-11"><option value="">{categoriesLoading ? "Đang tải ngành nghề..." : "Tất cả ngành nghề"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
        <Button type="submit" className="h-11 px-7">Tìm kiếm</Button>
      </form>
    </div>
  </section>;
}
