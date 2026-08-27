"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarDays,
    ChevronRight,
    ExternalLink,
    Globe2,
    Heart,
    Home,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Users,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { jobsApi } from "@/modules/jobs/api";
import type { Job, JobSort } from "@/modules/jobs/types";
import { companiesApi1 } from "../api";
import {
    ABOUT_SECTION_ID,
    COMPANY_JOBS_PAGE_SIZE,
    COMPANY_JOBS_PREVIEW_LIMIT,
    COMPANY_JOBS_SECTION_ID,
    CompanyAboutSection,
    CompanyJobsPreviewSection,
    CompanyJobsSection,
    CompanyLogo,
    DEFAULT_REVIEW_COUNT,
    displayWebsite,
    formatDate,
    normalizeLogo,
    normalizeWebsite,
} from "../components/company-detail-ui";
import type { Company } from "../types";

type DetailTab = "about" | "jobs" | "reviews";

export default function CompanyDetailPage() {
    const params = useParams();
    const companyId = String(params?.id ?? "");
    const [company, setCompany] = useState<Company | null>(null);
    const [companyPreviewJobs, setCompanyPreviewJobs] = useState<Job[]>([]);
    const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
    const [totalCompanyJobs, setTotalCompanyJobs] = useState(0);
    const [totalCompanyJobPages, setTotalCompanyJobPages] = useState(1);
    const [previewJobsLoading, setPreviewJobsLoading] = useState(true);
    const [previewJobsError, setPreviewJobsError] = useState<string | null>(null);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState<string | null>(null);
    const [jobKeyword, setJobKeyword] = useState("");
    const [jobLocation, setJobLocation] = useState("");
    const [jobExperience, setJobExperience] = useState("");
    const [jobType, setJobType] = useState("");
    const [jobSort, setJobSort] = useState<JobSort>("newest");
    const [jobPage, setJobPage] = useState(1);
    const [activeTab, setActiveTab] = useState<DetailTab>("about");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const resolvedCompanyId = company?.id ?? "";

    const scrollToSection = useCallback((sectionId: string, tab: DetailTab) => {
        setActiveTab(tab);
        window.setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 0);
    }, []);

    const loadCompany = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await companiesApi1.getById(companyId);
            setCompany(res.data);
        } catch (err) {
            setCompany(null);
            setCompanyPreviewJobs([]);
            setCompanyJobs([]);
            setTotalCompanyJobs(0);
            setTotalCompanyJobPages(1);
            setError(err instanceof Error ? err.message : "Không tải được thông tin công ty.");
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const loadCompanyJobPreview = useCallback(async () => {
        if (!resolvedCompanyId) return;
        setPreviewJobsLoading(true);
        setPreviewJobsError(null);
        try {
            const jobsRes = await jobsApi.list({
                keyword: "",
                companyId: resolvedCompanyId,
                location: "",
                categoryId: "",
                jobMode: "",
                jobType: "",
                minSalary: "",
                maxSalary: "",
                maxExperience: "",
                sort: "newest",
                page: 1,
                size: COMPANY_JOBS_PREVIEW_LIMIT,
            });
            setCompanyPreviewJobs(jobsRes.data);
            setTotalCompanyJobs(jobsRes.pagination.total);
        } catch (err) {
            setCompanyPreviewJobs([]);
            setPreviewJobsError(err instanceof Error ? err.message : "Không tải được danh sách việc làm.");
        } finally {
            setPreviewJobsLoading(false);
        }
    }, [resolvedCompanyId]);

    const loadCompanyJobs = useCallback(async () => {
        if (!resolvedCompanyId) return;
        setJobsLoading(true);
        setJobsError(null);
        try {
            const jobsRes = await jobsApi.list({
                keyword: jobKeyword,
                companyId: resolvedCompanyId,
                location: jobLocation,
                categoryId: "",
                jobMode: "",
                jobType,
                minSalary: "",
                maxSalary: "",
                maxExperience: jobExperience,
                sort: jobSort,
                page: jobPage,
                size: COMPANY_JOBS_PAGE_SIZE,
            });
            setCompanyJobs(jobsRes.data);
            setTotalCompanyJobs(jobsRes.pagination.total);
            setTotalCompanyJobPages(jobsRes.pagination.totalPages || 1);
        } catch (err) {
            setCompanyJobs([]);
            setTotalCompanyJobs(0);
            setTotalCompanyJobPages(1);
            setJobsError(err instanceof Error ? err.message : "Không tải được danh sách việc làm.");
        } finally {
            setJobsLoading(false);
        }
    }, [resolvedCompanyId, jobExperience, jobKeyword, jobLocation, jobPage, jobSort, jobType]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadCompany();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadCompany]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadCompanyJobPreview();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadCompanyJobPreview]);

    useEffect(() => {
        if (activeTab !== "jobs") return;

        const timer = window.setTimeout(() => {
            void loadCompanyJobs();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [activeTab, loadCompanyJobs]);

    const websiteHref = useMemo(() => normalizeWebsite(company?.website), [company?.website]);
    const logo = normalizeLogo(company?.logo);
    const companyFacts = useMemo(() => {
        if (!company) return [];

        return [
            { icon: Globe2, label: "Website", value: displayWebsite(company.website) },
            {
                icon: Users,
                label: "Quy mô",
                value: company.companySize ? `${company.companySize} nhân viên` : "Chưa cập nhật",
            },
            { icon: MapPin, label: "Địa chỉ", value: company.address || "Chưa cập nhật" },
            { icon: Mail, label: "Email", value: company.email || "Chưa cập nhật" },
            { icon: Phone, label: "Điện thoại", value: company.phone || "Chưa cập nhật" },
            { icon: Building2, label: "Mã số thuế", value: company.taxCode || "Chưa cập nhật" },
            { icon: CalendarDays, label: "Ngày tạo hồ sơ", value: formatDate(company.createdAt) },
        ];
    }, [company]);

    const updateJobKeyword = useCallback((value: string) => {
        setJobKeyword(value);
        setJobPage(1);
    }, []);

    const updateJobLocation = useCallback((value: string) => {
        setJobLocation(value);
        setJobPage(1);
    }, []);

    const updateJobExperience = useCallback((value: string) => {
        setJobExperience(value);
        setJobPage(1);
    }, []);

    const updateJobType = useCallback((value: string) => {
        setJobType(value);
        setJobPage(1);
    }, []);

    const updateJobSort = useCallback((value: JobSort) => {
        setJobSort(value);
        setJobPage(1);
    }, []);

    const tabClass = useCallback(
        (tab: DetailTab) =>
            [
                "px-1 py-3 transition",
                activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-slate-500 hover:text-slate-800",
            ].join(" "),
        [activeTab],
    );

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="container mx-auto w-full px-5 pb-8 md:px-0">
                <nav className="flex h-10 items-center gap-1.5 text-xs text-slate-500">
                    <Link href={ROUTES.home} className="flex items-center gap-1 transition hover:text-primary">
                        <Home className="h-3.5 w-3.5" />
                        <span>Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <Link href={ROUTES.companies} className="transition hover:text-primary">
                        Công ty
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="line-clamp-1 font-semibold text-slate-800">
                        {company?.name || "Chi tiết công ty"}
                    </span>
                </nav>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-20 text-sm text-slate-500 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải thông tin công ty...
                    </div>
                ) : error ? (
                    <div className="space-y-4 rounded-lg border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => void loadCompany()}
                                className="rounded border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                                Thử lại
                            </button>
                            <Link
                                href={ROUTES.companies}
                                className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Quay lại danh sách
                            </Link>
                        </div>
                    </div>
                ) : company ? (
                    <>
                        <section className="relative min-h-[176px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="absolute inset-y-0 right-0 hidden w-[46%] overflow-hidden md:block">
                                {logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logo} alt={company.name} className="h-full w-full scale-125 object-contain p-10 opacity-25" />
                                ) : null}
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.86)_20%,rgba(255,255,255,0.28)_58%,rgba(226,239,255,0.85)_100%)]" />
                            </div>

                            <div className="relative flex max-w-4xl flex-col gap-4 px-5 py-7 sm:flex-row sm:px-7">
                                <CompanyLogo company={company} />
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                                        {company.name}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 sm:text-sm">
                                        <span className="inline-flex items-center gap-1">
                                            <Globe2 className="h-3.5 w-3.5" />
                                            {displayWebsite(company.website)}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {company.address || "Đang cập nhật địa chỉ"}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            {company.companySize ? `${company.companySize} nhân viên` : "Chưa cập nhật quy mô"}
                                        </span>
                                    </div>
                                    <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-slate-600">
                                        {company.description || "Công ty đang cập nhật thông tin giới thiệu, văn hóa doanh nghiệp và cơ hội phát triển cho ứng viên."}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {websiteHref ? (
                                            <a
                                                href={websiteHref}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-primary px-3.5 text-xs font-semibold text-primary transition hover:bg-blue-50 sm:text-sm"
                                            >
                                                Website công ty
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        ) : null}
                                        <button
                                            type="button"
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                                        >
                                            <Heart className="h-3.5 w-3.5" />
                                            Lưu công ty
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="border-b border-slate-200">
                            <div className="flex gap-8 text-xs font-semibold text-slate-500 sm:text-sm">
                                <button
                                    type="button"
                                    onClick={() => scrollToSection(ABOUT_SECTION_ID, "about")}
                                    className={tabClass("about")}
                                >
                                    Giới thiệu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection(COMPANY_JOBS_SECTION_ID, "jobs")}
                                    className={tabClass("jobs")}
                                >
                                    Việc làm ({totalCompanyJobs})
                                </button>
                                <button type="button" className={tabClass("reviews")}>
                                    Đánh giá ({DEFAULT_REVIEW_COUNT})
                                </button>
                            </div>
                        </div>

                        {activeTab === "jobs" ? (
                            <div className="pt-5">
                                <CompanyJobsSection
                                    company={company}
                                    jobs={companyJobs}
                                    total={totalCompanyJobs}
                                    totalPages={totalCompanyJobPages}
                                    page={jobPage}
                                    keyword={jobKeyword}
                                    location={jobLocation}
                                    maxExperience={jobExperience}
                                    jobType={jobType}
                                    sort={jobSort}
                                    loading={jobsLoading}
                                    error={jobsError}
                                    onKeywordChange={updateJobKeyword}
                                    onLocationChange={updateJobLocation}
                                    onMaxExperienceChange={updateJobExperience}
                                    onJobTypeChange={updateJobType}
                                    onSortChange={updateJobSort}
                                    onPageChange={setJobPage}
                                />
                            </div>
                        ) : (
                            <>
                                <CompanyAboutSection company={company} companyFacts={companyFacts} />
                                <CompanyJobsPreviewSection
                                    company={company}
                                    jobs={companyPreviewJobs}
                                    total={totalCompanyJobs}
                                    loading={previewJobsLoading}
                                    error={previewJobsError}
                                    onViewAll={() => scrollToSection(COMPANY_JOBS_SECTION_ID, "jobs")}
                                />
                            </>
                        )}
                    </>
                ) : null}
            </div>
        </main>
    );
}
