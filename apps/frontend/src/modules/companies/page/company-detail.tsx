"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ChevronRight,
    CircleDollarSign,
    ExternalLink,
    Globe2,
    Heart,
    Home,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    Trophy,
    Users,
    type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { companiesApi } from "../api";
import type { Company } from "../types";

const DEFAULT_REVIEW_COUNT = "1.234";
const DEFAULT_OPEN_JOBS = 28;

const reasonItems = [
    { icon: Trophy, label: "Môi trường quốc tế, năng động" },
    { icon: BriefcaseBusiness, label: "Cơ hội phát triển và đào tạo liên tục" },
    { icon: CircleDollarSign, label: "Chính sách đãi ngộ cạnh tranh" },
    { icon: Heart, label: "Nhiều hoạt động văn hóa, thể thao" },
];

const sampleJobs = [
    {
        title: "Lập trình viên Backend (Java)",
        location: "Hà Nội",
        salary: "25 - 35 triệu VND",
        tags: ["Java", "Spring Boot", "MySQL"],
        posted: "2 giờ trước",
    },
    {
        title: "Kỹ sư DevOps",
        location: "Hà Nội",
        salary: "30 - 45 triệu VND",
        tags: ["Docker", "Kubernetes", "AWS"],
        posted: "5 giờ trước",
    },
    {
        title: "Chuyên viên Phân tích dữ liệu",
        location: "Hà Nội",
        salary: "15 - 26 triệu VND",
        tags: ["SQL", "Python", "Power BI"],
        posted: "1 ngày trước",
    },
    {
        title: "Lập trình viên Frontend (React)",
        location: "Hà Nội",
        salary: "20 - 30 triệu VND",
        tags: ["React", "TypeScript", "Tailwind CSS"],
        posted: "2 ngày trước",
    },
];

function getCompanyMark(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function normalizeLogo(logo?: string | null) {
    if (!logo) return "";
    if (logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/")) {
        return logo;
    }
    return "";
}

function normalizeWebsite(website?: string | null) {
    if (!website) return "";
    if (website.startsWith("http://") || website.startsWith("https://")) return website;
    return `https://${website}`;
}

function displayWebsite(website?: string | null) {
    return website?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "Chưa cập nhật";
}

function formatDate(value?: string | null) {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
    return date.toLocaleDateString("vi-VN");
}

function CompanyLogo({ company }: { company: Company }) {
    const logo = normalizeLogo(company.logo);

    return (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white text-sm font-bold text-primary shadow-sm">
            {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={company.name} className="h-full w-full object-contain p-2" />
            ) : (
                getCompanyMark(company.name)
            )}
        </div>
    );
}

function FactItem({
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

export default function CompanyDetailPage() {
    const params = useParams();
    const companyId = String(params?.id ?? "");
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await companiesApi.getById(companyId);
            setCompany(res.data);
        } catch (err) {
            setCompany(null);
            setError(err instanceof Error ? err.message : "Không tải được thông tin công ty.");
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void load();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [load]);

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
                                onClick={() => void load()}
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
                                <button type="button" className="border-b-2 border-primary px-1 py-3 text-primary">
                                    Giới thiệu
                                </button>
                                <button type="button" className="px-1 py-3 hover:text-slate-800">
                                    Việc làm ({DEFAULT_OPEN_JOBS})
                                </button>
                                <button type="button" className="px-1 py-3 hover:text-slate-800">
                                    Đánh giá ({DEFAULT_REVIEW_COUNT})
                                </button>
                            </div>
                        </div>

                        <section className="grid gap-5 py-7 lg:grid-cols-[minmax(0,1fr)_380px]">
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

                        <section className="pb-8">
                            <h2 className="mb-4 text-base font-bold text-slate-950 sm:text-lg">Các tin đang tuyển</h2>
                            <div className="grid gap-4 lg:grid-cols-2">
                                {sampleJobs.map((job) => (
                                    <article key={job.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="line-clamp-1 text-sm font-bold text-slate-950">
                                                        {job.title}
                                                    </h3>
                                                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                                                        Mới
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs font-medium text-slate-500">{company.name}</p>
                                            </div>
                                            <Link
                                                href={ROUTES.jobs}
                                                aria-label={`Xem ${job.title}`}
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-primary"
                                            >
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {job.location}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CircleDollarSign className="h-3.5 w-3.5" />
                                                {job.salary}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {job.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <p className="text-xs text-slate-500">{job.posted}</p>
                                            <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-5 flex justify-center">
                                <Link
                                    href={ROUTES.jobs}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-primary bg-white px-4 text-xs font-semibold text-primary transition hover:bg-blue-50 sm:text-sm"
                                >
                                    Xem tất cả {DEFAULT_OPEN_JOBS} tin tuyển dụng
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </section>
                    </>
                ) : null}
            </div>
        </main>
    );
}
