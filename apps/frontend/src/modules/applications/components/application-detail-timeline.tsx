"use client";

import { Check, Info } from "lucide-react";
import type { ApplicationTimelineStep } from "../types";

interface ApplicationDetailTimelineProps {
  timeline: ApplicationTimelineStep[];
}

export function ApplicationDetailTimeline({ timeline }: ApplicationDetailTimelineProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
      <h3 className="text-base font-bold text-slate-900 sm:text-lg">Lộ trình xử lý đơn</h3>

      <div className="space-y-0">
        {timeline.map((step, index) => {
          const isDone = step.status === "COMPLETED" || step.status === "CURRENT";
          const isLast = index === timeline.length - 1;

          return (
            <div key={index} className="flex gap-4">
              <div className="flex w-6 shrink-0 flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                    isDone
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : null}
                </div>
                {!isLast ? <div className="my-1 w-0.5 flex-1 min-h-8 bg-slate-200" /> : null}
              </div>

              <div
                className={`flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${
                  isLast ? "pb-0" : "pb-8"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <h4
                    className={`text-sm font-bold ${
                      isDone ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>

                <div className="shrink-0 text-xs font-semibold text-slate-500 sm:text-right">
                  {step.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/80 p-3.5 text-xs text-blue-900">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span>
          Thời gian xử lý dự kiến: <span className="font-bold">3 - 7 ngày làm việc</span>.
        </span>
      </div>
    </div>
  );
}
