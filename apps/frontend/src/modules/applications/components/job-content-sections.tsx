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

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
      {/* Navigation tabs */}
      <div className="border-b border-slate-100 pb-3 flex flex-wrap gap-1 sm:gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-50/80 text-primary border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-10">
        {/* Section 1: Mô tả công việc */}
        <section id="description" className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Mô tả công việc</h3>
          <ul className="space-y-3 text-sm leading-relaxed text-slate-600">
            {job.description.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2: Yêu cầu ứng viên */}
        <section id="requirements" className="space-y-4 border-t border-slate-100 pt-8">
          <h3 className="text-lg font-bold text-slate-900">Yêu cầu ứng viên</h3>
          <ul className="space-y-3 text-sm leading-relaxed text-slate-600">
            {job.requirements.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: Quyền lợi / Phúc lợi */}
        <section id="benefits" className="space-y-4 border-t border-slate-100 pt-8">
          <h3 className="text-lg font-bold text-slate-900">Quyền lợi / Phúc lợi</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-slate-600">
            {job.benefits.map((item, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Kỹ năng */}
        <section id="skills" className="space-y-5 border-t border-slate-100 pt-8">
          <h3 className="text-lg font-bold text-slate-900">Kỹ năng</h3>

          {/* Bắt buộc */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Bắt buộc</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {job.skills.required.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl border border-blue-200 bg-blue-50/60 px-3.5 py-1.5 text-xs font-semibold text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tùy chọn */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Tùy chọn</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {job.skills.optional.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
