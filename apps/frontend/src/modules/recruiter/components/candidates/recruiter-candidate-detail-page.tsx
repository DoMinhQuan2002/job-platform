"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  User,
  UserRoundX,
} from "lucide-react";
import {
  recruiterApplicationsApi,
  type RecruiterApplicationDetail,
  type RecruiterApplicationStatus,
} from "@/services/recruiter-applications.service";
import { ROUTES } from "@/constants/routes";

type DetailTab = "INFO" | "CV" | "NOTES" | "HISTORY";

const tabs: Array<{ value: DetailTab; label: string }> = [
  { value: "INFO", label: "Thông tin ứng viên" },
  { value: "CV", label: "CV ứng tuyển" },
  { value: "NOTES", label: "Đánh giá & ghi chú" },
  { value: "HISTORY", label: "Lịch sử trạng thái" },
];

const statusLabels: Record<RecruiterApplicationStatus, string> = {
  APPLIED: "Đã nộp",
  VIEWED: "HR đã xem",
  INTERVIEW: "Mời phỏng vấn",
  ACCEPTED: "Trúng tuyển",
  REJECTED: "Không đạt",
  WITHDRAWN: "Đã rút",
};

const statusStyles: Record<RecruiterApplicationStatus, string> = {
  APPLIED: "bg-blue-50 text-blue-700 border-blue-100",
  VIEWED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  INTERVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  ACCEPTED: "bg-violet-50 text-violet-700 border-violet-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  WITHDRAWN: "bg-slate-100 text-slate-600 border-slate-200",
};

const nextStatusOptions: Partial<
  Record<RecruiterApplicationStatus, Array<Exclude<RecruiterApplicationStatus, "WITHDRAWN">>>
> = {
  APPLIED: ["VIEWED", "REJECTED"],
  VIEWED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["ACCEPTED", "REJECTED"],
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

const getAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null;
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return age;
};

const monthLabel = (start?: string | null, end?: string | null, isCurrent?: boolean) => {
  const from = start ? formatDate(start) : "—";
  const to = isCurrent ? "Hiện tại" : end ? formatDate(end) : "—";
  return `${from} - ${to}`;
};

function StatusBadge({ status }: { status: RecruiterApplicationStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}

export function RecruiterCandidateDetailPage({ id }: { id: string }) {
  const [application, setApplication] = useState<RecruiterApplicationDetail | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("INFO");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recruiterApplicationsApi.detail(id, signal);
      if (signal?.aborted) return;
      setApplication(response.data);
    } catch (requestError) {
      if (signal?.aborted) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải thông tin ứng viên.",
      );
      setApplication(null);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => void load(controller.signal));
    return () => controller.abort();
  }, [load]);

  const candidate = application?.candidateProfile;
  const fallbackCandidate = application?.candidate;
  const candidateName = candidate?.fullName ?? fallbackCandidate?.fullName ?? "Ứng viên";
  const age = getAge(candidate?.dateOfBirth);

  const timeline = useMemo(() => {
    if (!application) return [];
    const steps: Array<{ status: RecruiterApplicationStatus; title: string; description: string }> = [
      { status: "APPLIED", title: "Đã nộp", description: "Ứng viên đã nộp đơn ứng tuyển." },
      { status: "VIEWED", title: "HR đã xem", description: "Nhà tuyển dụng đã xem hồ sơ của ứng viên." },
      { status: "INTERVIEW", title: "Mời phỏng vấn", description: "Ứng viên nằm trong giai đoạn phỏng vấn." },
      { status: "ACCEPTED", title: "Trúng tuyển", description: "Ứng viên đạt yêu cầu tuyển dụng." },
      { status: "REJECTED", title: "Không đạt", description: "Ứng viên không phù hợp với vị trí." },
    ];
    const currentIndex = steps.findIndex((step) => step.status === application.status);
    return steps.map((step, index) => ({
      ...step,
      reached: currentIndex >= 0 && index <= currentIndex,
      current: step.status === application.status,
    }));
  }, [application]);

  const openResume = async () => {
    if (!application?.resumeSnapshotUrl) return;
    try {
      const response = await recruiterApplicationsApi.getResumeSnapshotUrl(application.resumeSnapshotUrl);
      window.open(response.data.url, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể mở CV của ứng viên.",
      );
    }
  };

  const downloadResume = async () => {
    if (!application?.resumeSnapshotUrl) return;
    try {
      const response = await recruiterApplicationsApi.getResumeSnapshotUrl(application.resumeSnapshotUrl);
      const fileResponse = await fetch(response.data.url);
      if (!fileResponse.ok) {
        throw new Error("Không thể tải CV của ứng viên.");
      }

      const blob = await fileResponse.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = application.resume?.fileName ?? `${candidateName}-cv.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải CV của ứng viên.",
      );
    }
  };

  const updateStatus = async (status: Exclude<RecruiterApplicationStatus, "WITHDRAWN">) => {
    if (!application || application.status === status) return;
    setUpdating(true);
    setError(null);

    try {
      const response = await recruiterApplicationsApi.updateStatus(application.id, status);
      setApplication({ ...application, status: response.data.status });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật trạng thái ứng viên.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-5 w-44 animate-pulse rounded bg-border" />
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-lg border border-border bg-surface" />
            <div className="h-80 animate-pulse rounded-lg border border-border bg-surface" />
          </div>
          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-lg border border-border bg-surface" />
            <div className="h-48 animate-pulse rounded-lg border border-border bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href={ROUTES.recruiter.candidates} className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Quay lại danh sách ứng viên
        </Link>
        <div className="rounded-lg border border-danger/20 bg-surface p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 size-10 text-danger" />
          <h1 className="font-semibold text-text">Không thể tải thông tin ứng viên</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button type="button" onClick={() => void load()} className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            <RefreshCw className="size-4" /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const availableStatusOptions = nextStatusOptions[application.status] ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link href={ROUTES.recruiter.candidates} className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
        <ArrowLeft className="size-3.5" /> Quay lại danh sách ứng viên
      </Link>

      {error && (
        <div className="rounded-lg border border-warning/20 bg-warning/10 px-4 py-3 text-xs text-warning">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="grid size-24 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {candidateName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(-2)
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h1 className="text-2xl font-bold text-text">{candidateName}</h1>
                  <StatusBadge status={application.status} />
                </div>
                <div className="mt-4 grid gap-3 text-xs text-muted sm:grid-cols-2">
                  <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {age ? `${age} tuổi` : "Chưa cập nhật ngày sinh"}</span>
                  <span className="flex items-center gap-2"><User className="size-4" /> Ứng viên</span>
                  <span className="flex items-center gap-2"><MapPin className="size-4" /> {candidate?.addressDetail ?? "Chưa cập nhật địa chỉ"}</span>
                  <span className="flex items-center gap-2"><Mail className="size-4" /> {candidate?.email ?? fallbackCandidate?.email ?? "Chưa có email"}</span>
                  <span className="flex items-center gap-2"><Phone className="size-4" /> {candidate?.phone ?? fallbackCandidate?.phone ?? "Chưa có SĐT"}</span>
                </div>
              </div>
            </div>
            <nav className="mt-5 flex overflow-x-auto border-t border-border pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`shrink-0 border-b-2 px-4 py-2 text-xs font-semibold transition ${
                    activeTab === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </section>

          {activeTab === "INFO" && (
            <Section title="Thông tin ứng viên">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-bold text-text">Giới thiệu bản thân</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {candidate?.bio || "Ứng viên chưa cập nhật phần giới thiệu bản thân."}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-text">Mục tiêu nghề nghiệp</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {candidate?.careerObjective || "Ứng viên chưa cập nhật mục tiêu nghề nghiệp."}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-text">Học vấn</h3>
                    <div className="space-y-3">
                      {(candidate?.educations ?? []).map((education) => (
                        <article key={education.id} className="flex gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-primary">
                            <GraduationCap className="size-4" />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-text">{education.school}</h4>
                            <p className="text-xs text-muted">{education.major ?? education.degree ?? "Chưa cập nhật ngành học"}</p>
                            <p className="mt-1 text-[11px] text-muted">{monthLabel(education.startDate, education.endDate, education.isCurrent)}</p>
                          </div>
                        </article>
                      ))}
                      {candidate?.educations.length === 0 && <p className="text-xs text-muted">Chưa cập nhật học vấn.</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-text">Kinh nghiệm làm việc</h3>
                    <div className="space-y-4 border-l border-border pl-4">
                      {(candidate?.workExperiences ?? []).map((experience) => (
                        <article key={experience.id} className="relative">
                          <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />
                          <h4 className="text-sm font-bold text-text">{experience.position}</h4>
                          <p className="text-xs text-muted">{experience.companyName}</p>
                          <p className="mt-1 text-[11px] text-muted">{monthLabel(experience.startDate, experience.endDate, experience.isCurrent)}</p>
                          {experience.description && <p className="mt-2 text-xs leading-relaxed text-muted">{experience.description}</p>}
                        </article>
                      ))}
                      {candidate?.workExperiences.length === 0 && <p className="text-xs text-muted">Chưa cập nhật kinh nghiệm.</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-bold text-text">Kỹ năng</h3>
                  <div className="flex flex-wrap gap-2">
                    {(candidate?.skills ?? []).map((item) => (
                      <span key={item.id} className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                        {item.skill.name}
                      </span>
                    ))}
                    {candidate?.skills.length === 0 && <p className="text-xs text-muted">Chưa cập nhật kỹ năng.</p>}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {activeTab === "CV" && (
            <Section title="Thông tin CV đã ứng tuyển">
              <div className="space-y-5">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-rose-50 text-rose-600">
                      <FileText className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text">{application.resume?.fileName ?? "CV ứng tuyển"}</p>
                      <p className="text-xs text-muted">Cập nhật: {formatDate(application.updatedAt ?? application.appliedAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={openResume} disabled={!application.resumeSnapshotUrl} className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50">
                      <Eye className="size-3.5" /> Xem CV
                    </button>
                    <button type="button" onClick={downloadResume} disabled={!application.resumeSnapshotUrl} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-surface disabled:opacity-50">
                      <Download className="size-3.5" /> Tải xuống
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 text-sm font-bold text-text">Ghi chú ứng tuyển của ứng viên</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    Chưa có ghi chú ứng tuyển riêng cho đơn này.
                  </p>
                </div>
              </div>
            </Section>
          )}

          {activeTab === "NOTES" && (
            <Section title="Đánh giá & ghi chú">
              <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted">
                Chức năng ghi chú nội bộ chưa có API lưu trữ. Khu vực này đã sẵn layout để nối dữ liệu khi backend bổ sung.
              </div>
            </Section>
          )}

          {activeTab === "HISTORY" && (
            <Section title="Lịch sử trạng thái đơn ứng tuyển">
              <ol className="space-y-4 border-l border-border pl-5">
                {timeline.map((step) => (
                  <li key={step.status} className="relative">
                    <span className={`absolute -left-[25px] top-1 grid size-3 place-items-center rounded-full ${step.reached ? "bg-primary" : "bg-border"}`} />
                    <div className={`rounded-lg border p-4 ${step.current ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-text">{step.title}</h3>
                        {step.current && <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">Hiện tại</span>}
                      </div>
                      <p className="mt-1 text-xs text-muted">{step.description}</p>
                      <p className="mt-2 text-[11px] text-muted">{step.status === "APPLIED" ? formatDateTime(application.appliedAt) : "—"}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-text">Thông tin đơn ứng tuyển</h2>
            <dl className="space-y-4 text-xs">
              <div className="flex gap-3">
                <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="font-semibold text-text">Tin tuyển dụng</dt>
                  <dd className="mt-1 font-semibold text-primary">{application.job?.title ?? `Tin #${application.jobId}`}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="font-semibold text-text">Ngày ứng tuyển</dt>
                  <dd className="mt-1 text-muted">{formatDateTime(application.appliedAt)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="font-semibold text-text">CV đã nộp</dt>
                  <dd className="mt-1 text-primary">{application.resume?.fileName ?? "CV ứng tuyển"}</dd>
                  <button type="button" onClick={openResume} disabled={!application.resumeSnapshotUrl} className="mt-2 rounded-lg border border-primary px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/5 disabled:opacity-50">
                    Xem CV
                  </button>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <dt className="font-semibold text-text">Trạng thái đơn</dt>
                <dd className="mt-2"><StatusBadge status={application.status} /></dd>
              </div>
              <div>
                <dt className="font-semibold text-text">Cập nhật trạng thái</dt>
                <dd className="mt-2">
                  <select
                    value=""
                    disabled={updating || availableStatusOptions.length === 0}
                    onChange={(event) => {
                      const nextStatus = event.target.value as Exclude<
                        RecruiterApplicationStatus,
                        "WITHDRAWN"
                      >;
                      if (nextStatus) void updateStatus(nextStatus);
                    }}
                    className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-muted"
                  >
                    <option value="">
                      {availableStatusOptions.length === 0
                        ? "Không còn trạng thái có thể cập nhật"
                        : "Chọn trạng thái tiếp theo"}
                    </option>
                    {availableStatusOptions.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusLabels[statusOption]}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-text">Thao tác nhanh</h2>
            <div className="space-y-2">
              <button type="button" onClick={openResume} disabled={!application.resumeSnapshotUrl} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-background disabled:opacity-50">
                <Eye className="size-3.5" /> Xem CV
              </button>
              <button type="button" onClick={downloadResume} disabled={!application.resumeSnapshotUrl} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-background disabled:opacity-50">
                <Download className="size-3.5" /> Tải CV về máy
              </button>
              <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text opacity-60">
                <Send className="size-3.5" /> Gửi tin nhắn
              </button>
              {/* <button type="button" disabled={updating || application.status === "REJECTED" || application.status === "WITHDRAWN"} onClick={() => void updateStatus("REJECTED")} className="flex w-full items-center justify-center gap-2 rounded-lg border border-danger/20 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-50">
                <UserRoundX className="size-3.5" /> Loại ứng viên
              </button> */}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
