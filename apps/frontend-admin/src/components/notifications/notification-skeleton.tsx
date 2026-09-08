"use client";

interface NotificationSkeletonProps {
  count?: number;
  hasDetail?: boolean;
}

export function NotificationSkeleton({ count = 6, hasDetail = false }: NotificationSkeletonProps) {
  return (
    <div className="grid grid-cols-12 gap-6 items-start animate-pulse">
      {/* Left / Main List Skeleton */}
      <div
        className={`flex flex-col space-y-2 ${
          hasDetail ? "col-span-12 lg:col-span-7" : "col-span-12"
        }`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2 pr-4">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
            <div className="w-16 h-3 bg-slate-100 rounded flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Right Detail Panel Skeleton (only if hasDetail) */}
      {hasDetail && (
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[580px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="w-6 h-6 bg-slate-100 rounded-md" />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-20 bg-slate-50 rounded-xl" />
            <div className="space-y-3 pt-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <div className="h-8 bg-slate-100 rounded w-24" />
            <div className="h-8 bg-slate-100 rounded w-32" />
          </div>
        </div>
      )}
    </div>
  );
}
