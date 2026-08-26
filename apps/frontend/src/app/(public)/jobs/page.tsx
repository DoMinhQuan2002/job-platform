"use client";

import { Filter } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { JobsFilterPanel } from "@/components/jobs/jobs-filter-panel";
import { JobsResults } from "@/components/jobs/jobs-results";
import { JobsSearchBanner } from "@/components/jobs/jobs-search-banner";
import { JobsSidePanel } from "@/components/jobs/jobs-side-panel";
import { Button } from "@/components/ui/button";
import { jobsApi } from "@/modules/jobs/api";
import type { Job, JobCategory, JobFilters, JobSort } from "@/modules/jobs/types";

const initialFilters: JobFilters = { keyword: "", location: "", categoryId: "", jobMode: "", jobType: "", minSalary: "", maxSalary: "", maxExperience: "", sort: "newest", page: 1, size: 10 };

export default function JobsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    const next = filtersFromUrl(new URLSearchParams(window.location.search));
    setFilters(next);
    setAppliedFilters(next);
    setFiltersReady(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    jobsApi.listCategories(controller.signal)
      .then((response) => setCategories(response.data))
      .catch(() => {
        if (!controller.signal.aborted) setCategories([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    jobsApi.list(appliedFilters, controller.signal).then((response) => {
      setJobs(response.data);
      setPagination(response.pagination);
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Đã xảy ra lỗi khi tải dữ liệu.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [appliedFilters, requestVersion, filtersReady]);

  const changeFilter = useCallback((field: keyof JobFilters | string, value: string | number) => setFilters((current) => ({ ...current, [field]: value })), []);
  const applyFilters = () => { const next = { ...filters, page: 1 }; setFilters(next); setAppliedFilters(next); setFilterOpen(false); syncUrl(next); };
  const clearFilters = () => { setFilters(initialFilters); setAppliedFilters(initialFilters); setFilterOpen(false); syncUrl(initialFilters); };
  const changePage = (page: number) => { const next = { ...appliedFilters, page }; setFilters((current) => ({ ...current, page })); setAppliedFilters(next); syncUrl(next); window.scrollTo({ top: 300, behavior: "smooth" }); };
  const changeSort = (sort: JobSort) => { const next = { ...appliedFilters, sort, page: 1 }; setFilters((current) => ({ ...current, sort, page: 1 })); setAppliedFilters(next); syncUrl(next); };

  return <main className="bg-background pb-12"><div className="mx-auto container px-4 sm:px-6 2xl:px-0 py-6">
    <nav className="mb-5 text-xs text-muted" aria-label="Breadcrumb"><span>Trang chủ</span><span className="mx-2">›</span><strong className="font-medium text-text">Việc làm</strong></nav>
    <JobsSearchBanner keyword={filters.keyword} location={filters.location} categoryId={filters.categoryId} categories={categories} categoriesLoading={categoriesLoading} onChange={changeFilter} onSubmit={applyFilters} />
    <Button variant="outline" className="mb-4 w-full lg:hidden" onClick={() => setFilterOpen((open) => !open)}><Filter />{filterOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}</Button>
    <div className="grid items-start gap-5 lg:min-h-[calc(100vh+12rem)] lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_270px]">
      <JobsFilterPanel filters={filters} categories={categories} categoriesLoading={categoriesLoading} onChange={changeFilter} onApply={applyFilters} onClear={clearFilters} className={filterOpen ? "block" : "hidden lg:block"} />
      <JobsResults jobs={jobs} total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} sort={filters.sort} loading={loading} error={error} onSort={changeSort} onPage={changePage} onRetry={() => setRequestVersion((value) => value + 1)} onClear={clearFilters} />
      <div className="hidden xl:sticky xl:top-24 xl:block xl:self-start"><JobsSidePanel /></div>
    </div>
    <div className="mt-6 xl:hidden"><JobsSidePanel /></div>
  </div></main>;
}

function syncUrl(filters: JobFilters) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== "" && !(key === "page" && value === 1) && !(key === "size" && value === 10) && !(key === "sort" && value === "newest")) query.set(key, String(value)); });
  window.history.replaceState(null, "", `/jobs${query.size ? `?${query}` : ""}`);
}

function filtersFromUrl(query: URLSearchParams): JobFilters {
  const sort = query.get("sort");
  const page = Number(query.get("page"));
  const size = Number(query.get("size"));

  return {
    keyword: query.get("keyword") ?? "",
    location: query.get("location") ?? "",
    categoryId: query.get("categoryId") ?? "",
    jobMode: query.get("jobMode") ?? "",
    jobType: query.get("jobType") ?? "",
    minSalary: query.get("minSalary") ?? "",
    maxSalary: query.get("maxSalary") ?? "",
    maxExperience: query.get("maxExperience") ?? "",
    sort: isJobSort(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    size: Number.isInteger(size) && size > 0 ? size : 10,
  };
}

function isJobSort(value: string | null): value is JobSort {
  return value === "newest" || value === "deadline_asc" || value === "salary_asc" || value === "salary_desc";
}
