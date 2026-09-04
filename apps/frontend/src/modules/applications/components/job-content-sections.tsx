"use client";

import { useState } from "react";
import type { JobDetail } from "../types";

interface JobContentSectionsProps {
  job: JobDetail;
}

const TABS = [
  { id: "description", label: "Mô tả công việc" },
  { id: "requirements", label: "Yêu cầu ứng viên" },
  { id: "benefits", label: "Quyền lợi / Phúc lợi" },
  { id: "skills", label: "Kỹ năng" },
  { id: "company", label: "Thông tin công ty" },
];

export function JobContentSections({ job }: JobContentSectionsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="rounded-xl border border-border/30 bg-white p-5 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex flex-wrap gap-1 border-b border-border/30 pb-3 sm:gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted hover:bg-slate-50 hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "description" && (
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Mô tả công việc</h3>
            <ul className="space-y-2.5 text-sm leading-relaxed text-muted">
              {job.description.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "requirements" && (
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Yêu cầu ứng viên</h3>
            <ul className="space-y-2.5 text-sm leading-relaxed text-muted">
              {job.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "benefits" && (
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">Quyền lợi / Phúc lợi</h3>
            <div className="grid grid-cols-1 gap-2.5 text-sm text-muted sm:grid-cols-2">
              {job.benefits.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "skills" && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Kỹ năng</h3>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="size-2 rounded-full bg-primary" />
                <span>Bắt buộc</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.required.length > 0 ? (
                  job.skills.required.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted">Không có yêu cầu kỹ năng bắt buộc cụ thể.</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="size-2 rounded-full bg-muted-foreground/50" />
                <span>Tùy chọn</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.optional.length > 0 ? (
                  job.skills.optional.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted">Không có kỹ năng tùy chọn.</span>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "company" && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Thông tin công ty</h3>
            <div className="space-y-2.5 text-sm text-muted">
              <div className="font-semibold text-foreground text-base">
                {job.company.name}
              </div>
              {job.company.industry ? (
                <p>
                  <span className="font-medium text-foreground">Lĩnh vực: </span>
                  {job.company.industry}
                </p>
              ) : null}
              {job.company.size ? (
                <p>
                  <span className="font-medium text-foreground">Quy mô: </span>
                  {job.company.size}
                </p>
              ) : null}
              {job.company.address ? (
                <p>
                  <span className="font-medium text-foreground">Địa chỉ: </span>
                  {job.company.address}
                </p>
              ) : null}
              {job.company.about ? (
                <div className="pt-2">
                  <span className="font-medium text-foreground">Giới thiệu công ty:</span>
                  <p className="mt-1 leading-relaxed text-muted">
                    {job.company.about}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

