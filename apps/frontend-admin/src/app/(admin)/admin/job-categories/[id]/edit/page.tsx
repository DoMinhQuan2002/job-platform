"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import {
  adminJobCategoriesApi,
  type JobCategoryItem,
} from "@/services/admin-job-categories.service";
import { JobCategoryForm } from "@/components/job-categories/job-category-form";

interface EditJobCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditJobCategoryPage({ params }: EditJobCategoryPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [category, setCategory] = useState<JobCategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isIgnored = false;
    const controller = new AbortController();

    adminJobCategoriesApi
      .detail(id, controller.signal)
      .then((data) => {
        if (!isIgnored) {
          setCategory(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isIgnored && !controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin chi tiết ngành nghề."
          );
        }
      })
      .finally(() => {
        if (!isIgnored && !controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      isIgnored = true;
      controller.abort();
    };
  }, [id, reloadKey]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl w-full">
        {/* Back Button */}
        <div>
          <Link
            href="/admin/job-categories"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">
            Đang tải thông tin ngành nghề...
          </p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6 max-w-6xl w-full">
        {/* Back Button */}
        <div>
          <Link
            href="/admin/job-categories"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{error || "Không tìm thấy ngành nghề"}</span>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setReloadKey((k) => k + 1);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <JobCategoryForm initialData={category} mode="edit" />;
}
