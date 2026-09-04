"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Globe2,
  Heart,
  Mail,
  MapPin,
  Phone,
  Search,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { resolveStorageUrl } from "@/lib/utils";
import type { Job, JobSort } from "@/modules/jobs/types";
import type { Company } from "../types";

export const DEFAULT_REVIEW_COUNT = "1.234";
export const COMPANY_JOBS_PAGE_SIZE = 3;
export const COMPANY_JOBS_PREVIEW_LIMIT = 4;
export const ABOUT_SECTION_ID = "company-about";
export const COMPANY_JOBS_SECTION_ID = "company-jobs";

const reasonItems = [
  { icon: Trophy, label: "Môi trường quốc tế, năng động" },
  { icon: BriefcaseBusiness, label: "Cơ hội phát triển và đào tạo liên tục" },
  { icon: CircleDollarSign, label: "Chính sách đãi ngộ cạnh tranh" },
  { icon: Heart, label: "Nhiều hoạt động văn hóa, thể thao" },
];

export function getCompanyMark(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function normalizeLogo(logo?: string | null) {
  if (!logo) return "";
  return resolveStorageUrl(logo) || "";
}

export function normalizeWebsite(website?: string | null) {
  if (!website) return "";
  if (website.startsWith("http://") || website.startsWith("https://")) return website;
  return `https://${website}`;
}

export function displayWebsite(website?: string | null) {
  return website?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "Chưa cập nhật";
}

export function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function formatSalary(job: Job) {
  if (job.isNegotiable || (!job.salaryMin && !job.salaryMax)) return "Thỏa thuận";
  const format = (value: string | null) =>
    value ? `${Math.round(Number(value) / 1_000_000)} triệu` : "";
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join(" - ");
}

export function CompanyLogo({ company }: { company: Company }) {
  const logo = normalizeLogo(company.logo);

  return (
    <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white text-sm font-bold text-primary shadow-sm">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={company.name} className="h-full w-full object-cover" />
      ) : (
        getCompanyMark(company.name)
      )}
    </div>
  );
}

export function FactItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

export type CompanyFact = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function CompanyAboutSection({
  company,
  companyFacts,
}: {
  company: Company;
  companyFacts: CompanyFact[];
}) {
  return (
    <section id={ABOUT_SECTION_ID} className="grid scroll-mt-24 gap-5 py-7 lg:grid-cols-[minmax(0,1fr)_380px]">
      <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-950 sm:text-lg">Giới thiệu công ty</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
          {company.description || "Thông tin giới thiệu đang được cập nhật."}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {companyFacts.map((fact) => (
            <FactItem
              key={fact.label}
              icon={fact.icon}
              label={fact.label}
              value={fact.value}
            />
          ))}
        </div>
      </article>

      <aside className="rounded-lg border border-blue-100 bg-blue-50 p-6">
        <h2 className="text-base font-bold leading-6 text-blue-950">
          Tại sao làm việc tại {company.name}?
        </h2>
        <div className="mt-5 grid gap-4">
          {reasonItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-primary shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="pt-1 text-xs font-semibold leading-5 text-slate-700 sm:text-sm">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </aside>
    </section>
  );
}

function CompanyJobCard({ company, job }: { company: Company; job: Job }) {
  const skills = job.jobSkills
    ?.slice(0, 3)
    .map((item) => item.skill?.name)
    .filter(Boolean) ?? [];

  return (
    <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-bold text-slate-950">
                {job.title}
                <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 align-middle text-[10px] font-bold text-primary">
                  Mới
                </span>
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">{company.name}</p>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-slate-500">
              {formatDate(job.createdAt)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.address}
            </span>
            <span className="inline-flex items-center gap-1">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              {job.experience == null ? "Không yêu cầu" : `${job.experience} năm`}
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {formatSalary(job)}
            </span>
          </div>

          {skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <Link
          href={`${ROUTES.jobs}/${job.id}`}
          aria-label={`Xem ${job.title}`}
          className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-primary"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function CompanyJobsPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages =
    totalPages <= 5
      ? pages
      : [1, 2, 3, Math.max(4, totalPages - 1), totalPages].filter(
        (item, index, array) => array.indexOf(item) === index,
      );

  return (
    <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Phân trang việc làm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        aria-label="Trang trước"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>

      {visiblePages.map((item, index) => {
        const previous = visiblePages[index - 1];
        const showGap = Boolean(previous && item - previous > 1);

        return (
          <div key={item} className="flex items-center gap-2">
            {showGap ? <span className="px-1 text-xs text-slate-400">...</span> : null}
            <button
              type="button"
              onClick={() => onPageChange(item)}
              className={[
                "flex h-9 w-9 items-center justify-center rounded border text-xs font-semibold transition",
                item === page
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-primary",
              ].join(" ")}
            >
              {item}
            </button>
          </div>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function CompanyIntroSidebar({ company }: { company: Company }) {
  const sidebarFacts = [
    { icon: Globe2, label: "Website", value: displayWebsite(company.website) },
    {
      icon: Users,
      label: "Quy mô",
      value: company.companySize ? `${company.companySize} nhân viên` : "Chưa cập nhật",
    },
    { icon: MapPin, label: "Địa chỉ", value: company.address || "Chưa cập nhật" },
    { icon: CalendarDays, label: "Thành lập", value: formatDate(company.createdAt) },
    { icon: Building2, label: "Lĩnh vực hoạt động", value: "Đang cập nhật" },
  ];

  return (
    <aside className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-20 lg:self-start">
      <h2 className="text-base font-bold text-slate-950">Giới thiệu công ty</h2>
      <p className="mt-4 line-clamp-6 text-xs leading-5 text-slate-600">
        {company.description || "Thông tin giới thiệu đang được cập nhật."}
      </p>

      <div className="mt-6 grid gap-4">
        {sidebarFacts.map((fact) => (
          <FactItem
            key={fact.label}
            icon={fact.icon}
            label={fact.label}
            value={fact.value}
          />
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold text-slate-500">Mạng xã hội</p>
        <div className="mt-2 flex gap-2">
          {[Globe2, Mail, Phone].map((Icon, index) => (
            <span
              key={index}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function CompanyJobsSection({
  company,
  jobs,
  total,
  totalPages,
  page,
  keyword,
  location,
  maxExperience,
  jobType,
  sort,
  loading,
  error,
  onKeywordChange,
  onLocationChange,
  onMaxExperienceChange,
  onJobTypeChange,
  onSortChange,
  onPageChange,
}: {
  company: Company;
  jobs: Job[];
  total: number;
  totalPages: number;
  page: number;
  keyword: string;
  location: string;
  maxExperience: string;
  jobType: string;
  sort: JobSort;
  loading: boolean;
  error: string | null;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMaxExperienceChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onSortChange: (value: JobSort) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <section id={COMPANY_JOBS_SECTION_ID} className="scroll-mt-24 pb-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                placeholder="Tìm kiếm theo vị trí, kỹ năng..."
                className="h-11 w-full rounded border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-3 focus:ring-primary/10"
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Select value={location} onChange={(event) => onLocationChange(event.target.value)}>
                <option value="">Tất cả địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </Select>
              <Select value={maxExperience} onChange={(event) => onMaxExperienceChange(event.target.value)}>
                <option value="">Tất cả kinh nghiệm</option>
                <option value="0">Không yêu cầu</option>
                <option value="1">Dưới 1 năm</option>
                <option value="3">Dưới 3 năm</option>
                <option value="5">Dưới 5 năm</option>
              </Select>
              <Select value={jobType} onChange={(event) => onJobTypeChange(event.target.value)}>
                <option value="">Tất cả loại hình</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
              </Select>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-600">
                <strong>{total.toLocaleString("vi-VN")}</strong> việc làm phù hợp
              </p>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Sắp xếp:
                <Select
                  value={sort}
                  onChange={(event) => onSortChange(event.target.value as JobSort)}
                  className="h-8 min-w-32 border-0 shadow-none"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="salary_desc">Lương cao nhất</option>
                  <option value="salary_asc">Lương thấp nhất</option>
                  <option value="deadline_asc">Sắp hết hạn</option>
                </Select>
              </label>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {loading ? (
              Array.from({ length: COMPANY_JOBS_PAGE_SIZE }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                  <div className="p-5">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="mt-4 h-3 w-1/2 rounded bg-slate-100" />
                    <div className="mt-5 h-6 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="rounded-lg border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
                {error}
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <CompanyJobCard key={job.id} company={company} job={job} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Công ty hiện chưa có tin tuyển dụng phù hợp.
              </div>
            )}
          </div>

          {!loading && !error ? (
            <CompanyJobsPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          ) : null}
        </div>

        <CompanyIntroSidebar company={company} />
      </div>
    </section>
  );
}

export function CompanyJobsPreviewSection({
  company,
  jobs,
  total,
  loading,
  error,
  onViewAll,
}: {
  company: Company;
  jobs: Job[];
  total: number;
  loading: boolean;
  error: string | null;
  onViewAll: () => void;
}) {
  return (
    <section className="pb-8">
      <h2 className="mb-4 text-base font-bold text-slate-950 sm:text-lg">Các tin đang tuyển</h2>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: COMPANY_JOBS_PREVIEW_LIMIT }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
              <div className="p-5">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="mt-4 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-5 h-6 w-3/4 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((job) => (
              <CompanyJobCard key={job.id} company={company} job={job} />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-primary bg-white px-5 text-sm font-semibold text-primary transition hover:bg-blue-50"
            >
              Xem tất cả {total.toLocaleString("vi-VN")} tin tuyển dụng
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Công ty hiện chưa có tin tuyển dụng đang mở.
        </div>
      )}
    </section>
  );
}
