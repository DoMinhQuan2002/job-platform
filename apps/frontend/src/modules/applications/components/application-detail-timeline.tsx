"use client";

import { Check, Info } from "lucide-react";
import type { ApplicationTimelineStep } from "../types";

interface ApplicationDetailTimelineProps {
  timeline: ApplicationTimelineStep[];
}

export function ApplicationDetailTimeline({ timeline }: ApplicationDetailTimelineProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 space-y-6">
      <h3 className="text-base sm:text-lg font-bold text-slate-900">Lộ trình xử lý đơn</h3>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((step, index) => {
          const isDone = step.status === "COMPLETED" || step.status === "CURRENT";
          return (
            <div key={index} className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              {/* Timeline Icon Node */}
              <div
                className={`absolute -left-[30px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full transition ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "border-2 border-slate-300 bg-white"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : null}
              </div>

              {/* Text info */}
              <div className="pr-4">
                <h4
                  className={`text-sm font-bold ${
                    isDone ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
              </div>

              {/* Timestamp */}
              <div className="text-xs font-semibold text-slate-500 shrink-0 sm:text-right">
                {step.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info notice */}
      <div className="flex items-center gap-2.5 rounded-2xl bg-blue-50/80 p-3.5 text-xs text-blue-900 border border-blue-100">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span>
          Thời gian xử lý dự kiến: <span className="font-bold">3 - 7 ngày làm việc</span>.
        </span>
      </div>
    </div>
  );
}
