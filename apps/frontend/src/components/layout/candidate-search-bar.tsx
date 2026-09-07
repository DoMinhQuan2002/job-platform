"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BriefcaseBusiness,
  Building2,
  Clock,
  X,
  Loader2,
  TrendingUp,
  MapPin,
  ArrowRight,
  SearchX,
  WalletCards,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { jobsApi } from "@/modules/jobs/api";
import { companiesApi1 } from "@/modules/companies/api";
import type { Job } from "@/modules/jobs/types";
import type { Company } from "@/modules/companies/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const POPULAR_KEYWORDS = [
  "Frontend",
  "ReactJS",
  "NodeJS",
  "Java",
  "Tester",
  "Marketing",
  "Thực tập sinh",
  "UI/UX",
];

const RECENT_SEARCHES_STORAGE_KEY = "jp_candidate_recent_searches";

const storageListeners = new Set<() => void>();

function subscribeToRecentSearches(callback: () => void) {
  storageListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    storageListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getRecentSearchesSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function notifyRecentSearchesChanged() {
  storageListeners.forEach((listener) => listener());
}

function formatSalary(job: Job): string {
  if (job.isNegotiable || (!job.salaryMin && !job.salaryMax)) return "Thỏa thuận";
  const format = (value: string | null) =>
    value ? `${Math.round(Number(value) / 1_000_000)} triệu` : "";
  return [format(job.salaryMin), format(job.salaryMax)].filter(Boolean).join(" - ");
}

function normalizeLogo(logo?: string | null): string | undefined {
  if (!logo) return undefined;
  if (
    logo.startsWith("http://") ||
    logo.startsWith("https://") ||
    logo.startsWith("/")
  ) {
    return logo;
  }
  return undefined;
}

function CompanyLogo({ name, src }: { name?: string; src?: string | null }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = normalizeLogo(src);

  if (logoSrc && !failed) {
    return (
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white p-0.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={`Logo ${name || "Company"}`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  const initials = (name || "JP")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-slate-100 text-xs font-semibold text-muted">
      {initials}
    </span>
  );
}

interface CandidateSearchBarProps {
  className?: string;
  inputClassName?: string;
}

export function CandidateSearchBar({
  className,
  inputClassName,
}: CandidateSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [, startTransition] = useTransition();

  const recentSearchesRaw = useSyncExternalStore(
    subscribeToRecentSearches,
    getRecentSearchesSnapshot,
    getServerSnapshot,
  );

  const recentSearches = useMemo(() => {
    try {
      const parsed = JSON.parse(recentSearchesRaw);
      return Array.isArray(parsed) ? (parsed.slice(0, 5) as string[]) : [];
    } catch {
      return [];
    }
  }, [recentSearchesRaw]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Đóng dropdown khi click ra bên ngoài hoặc ấn Esc
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Tìm kiếm debounced với AbortController
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [jobsRes, companiesRes] = await Promise.allSettled([
          jobsApi.list(
            {
              keyword: trimmed,
              location: "",
              categoryId: "",
              jobMode: "",
              jobType: "",
              minSalary: "",
              maxSalary: "",
              maxExperience: "",
              sort: "newest",
              page: 1,
              size: 4,
            },
            controller.signal,
          ),
          companiesApi1.list({
            search: trimmed,
            page: 1,
            limit: 3,
            sort: "newest",
          }),
        ]);

        if (controller.signal.aborted) return;

        if (jobsRes.status === "fulfilled" && jobsRes.value?.data) {
          setJobs(jobsRes.value.data.slice(0, 4));
        } else {
          setJobs([]);
        }

        if (
          companiesRes.status === "fulfilled" &&
          companiesRes.value?.data?.items
        ) {
          setCompanies(companiesRes.value.data.items.slice(0, 3));
        } else {
          setCompanies([]);
        }
      } catch {
        if (!controller.signal.aborted) {
          setJobs([]);
          setCompanies([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Lưu từ khóa vào lịch sử
  const persistRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const filtered = recentSearches.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase(),
    );
    const next = [trimmed, ...filtered].slice(0, 5);
    try {
      localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(next),
      );
      notifyRecentSearchesChanged();
    } catch {
      // Ignored
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    e.preventDefault();
    const next = recentSearches.filter((item) => item !== itemToRemove);
    try {
      localStorage.setItem(
        RECENT_SEARCHES_STORAGE_KEY,
        JSON.stringify(next),
      );
      notifyRecentSearchesChanged();
    } catch {
      // Ignored
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      notifyRecentSearchesChanged();
    } catch {
      // Ignored
    }
  };

  // Xử lý submit tìm kiếm
  const handlePerformSearch = (keywordToSearch?: string) => {
    const text = (keywordToSearch ?? query).trim();
    if (!text) return;

    persistRecentSearch(text);
    setIsOpen(false);
    startTransition(() => {
      router.push(`${ROUTES.jobs}?keyword=${encodeURIComponent(text)}`);
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformSearch();
  };

  const handleSelectJob = (job: Job) => {
    persistRecentSearch(job.title);
    setIsOpen(false);
    startTransition(() => {
      router.push(`${ROUTES.jobs}/${job.id}`);
    });
  };

  const handleSelectCompany = (company: Company) => {
    persistRecentSearch(company.name);
    setIsOpen(false);
    startTransition(() => {
      router.push(`${ROUTES.companies}/${company.slug || company.id}`);
    });
  };

  const hasSearchText = query.trim().length > 0;
  const hasResults = jobs.length > 0 || companies.length > 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      role="search"
      aria-label="Tìm kiếm việc làm hoặc công ty"
    >
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <label htmlFor="header-search-input" className="sr-only">
          Tìm kiếm việc làm hoặc công ty
        </label>
        <input
          ref={inputRef}
          id="header-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (!val.trim()) {
              setJobs([]);
              setCompanies([]);
              setIsLoading(false);
            }
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm việc làm, công ty..."
          autoComplete="off"
          className={cn(
            "h-8 w-[230px] rounded-lg border border-border bg-slate-50 pl-3 pr-8 text-xs text-text outline-none placeholder:text-muted/70 transition-all duration-200",
            "focus:w-[280px] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10",
            inputClassName,
          )}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {hasSearchText && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setJobs([]);
                setCompanies([]);
                inputRef.current?.focus();
              }}
              className="grid size-4 place-items-center rounded-full text-muted/60 hover:bg-slate-200 hover:text-text transition"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="size-3" />
            </button>
          )}

          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin text-primary" />
          ) : (
            <button
              type="submit"
              className="text-muted/80 hover:text-primary transition"
              aria-label="Tìm kiếm"
            >
              <Search className="size-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Menu kết quả */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[380px] sm:w-[420px] rounded-xl border border-border bg-white p-3 shadow-xl transition-all">
          {/* TRƯỜNG HỢP 1: Chưa gõ từ khóa (Hiển thị Lịch sử & Gợi ý phổ biến) */}
          {!hasSearchText && (
            <div className="space-y-3.5">
              {/* Lịch sử tìm kiếm gần đây */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between border-b border-border/40 pb-1.5 px-1 text-[11px] font-semibold text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted/70" /> Tìm kiếm gần đây
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[10px] text-muted hover:text-danger transition"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((item) => (
                      <div
                        key={item}
                        onClick={() => {
                          setQuery(item);
                          handlePerformSearch(item);
                        }}
                        className="group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-text transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Search className="size-3 text-muted/60 group-hover:text-primary" />
                          <span className="truncate group-hover:text-primary font-medium">
                            {item}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, item)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-muted/60 hover:text-danger transition"
                          aria-label={`Xóa ${item} khỏi lịch sử`}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Từ khóa phổ biến / Gợi ý nổi bật */}
              <div>
                <div className="mb-2 flex items-center gap-1.5 border-b border-border/40 pb-1.5 px-1 text-[11px] font-semibold text-muted">
                  <TrendingUp className="size-3 text-primary" />
                  <span>Từ khóa thịnh hành</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-0.5 pt-0.5">
                  {POPULAR_KEYWORDS.map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => {
                        setQuery(keyword);
                        handlePerformSearch(keyword);
                      }}
                      className="rounded-md border border-border/80 bg-slate-50 px-2.5 py-1 text-xs text-muted transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: Đang gõ từ khóa */}
          {hasSearchText && (
            <div className="space-y-3">
              {/* Trạng thái Loading */}
              {isLoading && !hasResults && (
                <div className="flex items-center justify-center py-7 text-xs text-muted">
                  <Loader2 className="mr-2 size-4 animate-spin text-primary" />
                  Đang tìm việc làm và công ty...
                </div>
              )}

              {/* Không có kết quả */}
              {!isLoading && !hasResults && (
                <div className="rounded-lg border border-dashed border-border bg-slate-50/50 py-6 px-4 text-center">
                  <SearchX className="mx-auto size-7 text-muted/50 mb-1.5" />
                  <p className="text-xs font-semibold text-text">
                    Không tìm thấy kết quả phù hợp
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Thử tìm với từ khóa chung hơn như:{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => {
                        setQuery("React");
                        handlePerformSearch("React");
                      }}
                    >
                      React
                    </button>
                    ,{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => {
                        setQuery("Java");
                        handlePerformSearch("Java");
                      }}
                    >
                      Java
                    </button>
                  </p>
                </div>
              )}

              {/* Nhóm Việc làm gợi ý */}
              {jobs.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between border-b border-border/40 pb-1 px-1 text-[11px] font-semibold text-muted">
                    <span className="flex items-center gap-1.5">
                      <BriefcaseBusiness className="size-3 text-primary" /> Việc làm phù hợp
                    </span>
                    <span className="text-[10px] text-muted font-normal">
                      {jobs.length} việc làm
                    </span>
                  </div>
                  <div className="space-y-1">
                    {jobs.map((job) => {
                      const skills =
                        job.jobSkills
                          ?.map((item) => item.skill?.name)
                          .filter(Boolean)
                          .slice(0, 2) || [];

                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleSelectJob(job)}
                          className="group flex w-full items-start gap-3 rounded-lg border border-transparent p-2 text-left transition hover:border-primary/20 hover:bg-primary/5"
                        >
                          <CompanyLogo
                            name={job.company?.name}
                            src={job.company?.logo}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className="truncate text-xs font-bold text-text group-hover:text-primary transition-colors">
                                {job.title}
                              </p>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-muted">
                              {job.company?.name}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                              <strong className="flex items-center gap-1 text-text text-[11px]">
                                <WalletCards className="size-3 text-muted" />
                                {formatSalary(job)}
                              </strong>
                              {job.address && (
                                <span className="flex items-center gap-1 text-muted text-[11px] truncate max-w-[130px]">
                                  <MapPin className="size-3 text-muted/70 shrink-0" />
                                  <span className="truncate">{job.address}</span>
                                </span>
                              )}
                              {skills.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {skills.map((skill, sIdx) => (
                                    <span
                                      key={`s-${job.id}-${sIdx}`}
                                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-muted font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Nhóm Công ty gợi ý */}
              {companies.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 border-b border-border/40 pb-1 px-1 text-[11px] font-semibold text-muted">
                    <Building2 className="size-3 text-primary" />
                    <span>Công ty</span>
                  </div>
                  <div className="space-y-1">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleSelectCompany(company)}
                        className="group flex w-full items-center gap-3 rounded-lg border border-transparent p-2 text-left transition hover:border-primary/20 hover:bg-primary/5"
                      >
                        <CompanyLogo
                          name={company.name}
                          src={company.logo}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-text group-hover:text-primary transition-colors">
                            {company.name}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-muted">
                            {company.address || (company.companySize ? `${company.companySize} nhân viên` : "Công ty đang tuyển dụng")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút Xem tất cả kết quả */}
              <button
                type="button"
                onClick={() => handlePerformSearch()}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-1 w-full justify-center gap-1.5 border-primary text-xs text-primary! hover:bg-primary/10! font-semibold",
                )}
              >
                <span>Xem tất cả việc làm cho &quot;{query}&quot;</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
