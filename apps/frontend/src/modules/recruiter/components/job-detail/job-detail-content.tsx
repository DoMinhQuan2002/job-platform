"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecruiterJobDetail } from "@/services/recruiter-jobs.service";
import { formatDate, jobStatusLabels, jobTypeLabels, jobModeLabels, formatSalary } from "./job-detail-utils";

type Tab = "DESCRIPTION" | "APPLICATIONS" | "HISTORY";

export function JobDetailContent({ job }: { job: RecruiterJobDetail }) {
  const [tab, setTab] = useState<Tab>("DESCRIPTION");
  const tabs: Array<{ value: Tab; label: string }> = [
    { value: "DESCRIPTION", label: "Mô tả công việc" },
    { value: "APPLICATIONS", label: `Ứng viên (${job.applicationStats.total})` },
    { value: "HISTORY", label: "Lịch sử duyệt" },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto border-b border-border">
        <nav className="flex min-w-max px-2" aria-label="Nội dung tin tuyển dụng">
          {tabs.map((item) => <button key={item.value} type="button" onClick={() => setTab(item.value)} className={`border-b-2 px-4 py-3 text-xs font-medium ${tab === item.value ? "border-primary text-primary" : "border-transparent text-muted hover:text-text"}`}>{item.label}</button>)}
        </nav>
      </div>

      {tab === "DESCRIPTION" && (
        <div className="space-y-6 p-5 text-xs leading-6 text-muted">
          <section><h2 className="mb-2 text-sm font-semibold text-text">Mô tả công việc</h2><p className="whitespace-pre-line">{job.description}</p></section>
          <section><h2 className="mb-2 text-sm font-semibold text-text">Yêu cầu ứng viên</h2><p className="whitespace-pre-line">{job.requirements}</p></section>
          {job.benefits && <section><h2 className="mb-2 text-sm font-semibold text-text">Quyền lợi</h2><p className="whitespace-pre-line">{job.benefits}</p></section>}
          <section><h2 className="mb-3 text-sm font-semibold text-text">Kỹ năng yêu cầu</h2><div className="flex flex-wrap gap-2">{job.skills.length ? job.skills.map((skill) => <span key={skill.id} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-[10px] text-text">{skill.name}<i className={`rounded px-1.5 py-0.5 not-italic ${skill.isRequired ? "bg-primary/10 text-primary" : "bg-border/40 text-muted"}`}>{skill.isRequired ? "Bắt buộc" : "Ưu tiên"}</i></span>) : <span>Chưa cập nhật kỹ năng.</span>}</div></section>
          <section><h2 className="mb-3 text-sm font-semibold text-text">Thông tin khác</h2><div className="grid gap-2 sm:grid-cols-2"><p>• Kinh nghiệm: {job.experience ?? 0} năm</p><p>• Hình thức: {jobTypeLabels[job.jobType]}</p><p>• Số lượng tuyển: {job.quantity ?? 1} người</p><p>• Loại hình: {jobModeLabels[job.jobMode]}</p><p>• Ngành nghề: {job.category?.name ?? "Chưa cập nhật"}</p><p>• Lương: {formatSalary(job)}</p></div></section>
        </div>
      )}

      {tab === "APPLICATIONS" && <div className="p-8 text-center"><strong className="block text-2xl text-text">{job.applicationStats.total}</strong><p className="mt-1 text-xs text-muted">Ứng viên đã nộp hồ sơ cho tin này</p><Link href={`/recruiter/candidates?jobId=${job.id}`} className="mt-4 inline-flex rounded-md border border-primary px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5">Xem danh sách ứng viên</Link></div>}

      {tab === "HISTORY" && <div className="space-y-3 p-5 text-xs text-muted"><div className="rounded-md border border-border p-3"><strong className="text-text">Tạo tin tuyển dụng</strong><span className="float-right">{formatDate(job.createdAt)}</span></div><div className="rounded-md border border-border p-3"><strong className="text-text">Trạng thái hiện tại: {jobStatusLabels[job.status]}</strong><span className="float-right">{formatDate(job.updatedAt)}</span></div></div>}
    </section>
  );
}
