"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  MapPin,
  Search,
  Star,
  Users,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { companiesApi1 } from "../api";
import type { Company } from "../types";

const PAGE_SIZE = 10;
const DEFAULT_RATING = "4.3";

function getCompanyMark(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getCompanySummary(company: Company) {
  return company.description || "Công ty đang cập nhật thông tin giới thiệu.";
}

function getCompanyMeta(company: Company) {
  const parts = [
    company.companySize ? `${company.companySize} nhân viên` : "Chưa cập nhật quy mô",
    company.address || "Đang cập nhật địa chỉ",
  ];

  return parts.join(" - ");
}

function normalizeLogo(logo?: string | null) {
  if (!logo) return "";
  if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
    return logo;
  }
  return "";
}

function getCompanyHref(company: Company) {
  return `${ROUTES.companies}/${company.slug || company.id}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  return Array.from(pages).sort((a, b) => a - b);
}

function CompanyLogo({ company, variant = "list" }: { company: Company; variant?: "featured" | "list" }) {
  const logo = normalizeLogo(company.logo);
  const sizeClass = variant === "featured" ? "h-12 w-24 text-sm" : "h-12 w-16 text-xs";

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 font-bold text-primary ${sizeClass}`}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={company.name} className="h-full w-full bg-white object-contain p-1" />
      ) : (
        getCompanyMark(company.name)
      )}
    </div>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companiesApi1.list({
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setCompanies(res.data.items ?? []);
      setTotal(res.data.meta.total ?? 0);
      setTotalPages(Math.max(1, res.data.meta.totalPages ?? 1));
    } catch (err) {
      setCompanies([]);
      setTotal(0);
      setTotalPages(1);
      setError(err instanceof Error ? err.message : "Không tải được danh sách công ty.");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const featuredCompanies = useMemo(() => companies.slice(0, 5), [companies]);
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const pageStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto w-full px-5 pb-8 md:px-0">
        <nav className="flex h-10 items-center gap-1.5 text-xs text-slate-500">
          <Link href={ROUTES.home} className="flex items-center gap-1 transition hover:text-primary">
            <Home className="h-3.5 w-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Công ty</span>
        </nav>

        <section className="overflow-hidden border border-slate-200 bg-[#edf5ff]">
          <div className="grid min-h-[184px] md:grid-cols-[minmax(0,1fr)_minmax(320px,34%)]">
            <div className="flex flex-col justify-center px-5 py-9 sm:px-8 lg:px-10">
              <h1 className="max-w-2xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                Khám phá các công ty hàng đầu
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Tìm hiểu môi trường làm việc, văn hóa doanh nghiệp và cơ hội phát triển sự
                nghiệp tại các công ty uy tín trên JobPlatform.
              </p>
            </div>

            <div className="relative hidden overflow-hidden md:block">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,#ffffff_0,#eaf3ff_17%,transparent_35%),linear-gradient(135deg,#2056bd_0%,#386fd4_44%,#edf5ff_100%)]" />
            </div>
          </div>
        </section>

        <section className="border-x border-b border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950">Công ty nổi bật</h2>
            <Link
              href={ROUTES.companies}
              className="text-sm font-semibold text-primary hover:text-primary-hover"
            >
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải công ty...
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 rounded border border-rose-100 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : featuredCompanies.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Chưa có công ty nổi bật</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {featuredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={getCompanyHref(company)}
                  className="min-h-[168px] rounded border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CompanyLogo company={company} variant="featured" />
                  <h3 className="mt-5 line-clamp-1 text-sm font-bold text-slate-950">
                    {company.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                    {getCompanyMeta(company)}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-800">{DEFAULT_RATING}</span>
                  </div>
                  <span className="mt-3 inline-flex items-center rounded bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Nổi bật
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="border-x border-b border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950">Danh sách công ty</h2>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sắp xếp:</span>
              <span className="relative">
                <select
                  value="latest"
                  onChange={() => undefined}
                  className="h-9 cursor-pointer appearance-none rounded border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-primary"
                >
                  <option value="latest">Mới cập nhật</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-3 h-3.5 w-3.5 text-slate-400" />
              </span>
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách công ty...
            </div>
          ) : error ? (
            <div className="space-y-3 rounded border border-rose-100 bg-rose-50 p-5 text-sm text-rose-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Thử lại
              </button>
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Chưa có công ty phù hợp</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Danh sách công ty sẽ hiển thị tại đây khi có dữ liệu.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 border-y border-slate-100">
              {companies.map((company) => (
                <article
                  key={company.id}
                  className="grid gap-4 bg-white py-5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <CompanyLogo company={company} />
                  <div className="min-w-0">
                    <Link
                      href={getCompanyHref(company)}
                      className="line-clamp-1 text-sm font-bold text-slate-950 hover:text-primary sm:text-base"
                    >
                      {company.name}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {getCompanyMeta(company)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-slate-600 sm:text-sm">
                      {getCompanySummary(company)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-800">{DEFAULT_RATING}</span>
                      <span>(đang cập nhật)</span>
                    </div>
                    <Link
                      href={ROUTES.jobs}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-primary px-3.5 text-xs font-semibold text-primary transition hover:bg-blue-50"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Xem công việc
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {total > 0 && !loading && !error ? (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <span className="text-xs font-medium text-slate-500">
                Hiển thị {pageStart} - {pageEnd} trong {total} công ty
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {visiblePages.map((pageNum, index) => (
                  <div key={pageNum} className="flex items-center gap-1">
                    {index > 0 && pageNum - visiblePages[index - 1] > 1 ? (
                      <span className="px-1 text-xs text-slate-400">...</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold ${
                        pageNum === currentPage
                          ? "border-primary bg-primary text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="sr-only" aria-label="Thông tin nhanh">
          <Users /> Công ty, đánh giá và cơ hội việc làm đang được cập nhật.
        </section>
      </div>
    </main>
  );
}
