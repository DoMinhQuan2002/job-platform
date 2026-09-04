"use client";

export function AdminLayoutSkeleton() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* 1. Left Sidebar Skeleton: 260px */}
      <aside
        aria-hidden="true"
        className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white"
      >
        {/* Brand Header: 72px */}
        <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-5">
          <div className="size-9 rounded-lg bg-slate-200/80 animate-pulse" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 rounded bg-slate-200/80 animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Nav Items Skeleton */}
        <div className="flex-1 space-y-1.5 p-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            >
              <div className="size-5 shrink-0 rounded bg-slate-200/70 animate-pulse" />
              <div
                className="h-3.5 rounded bg-slate-200/70 animate-pulse"
                style={{ width: `${60 + (i % 4) * 12}%` }}
              />
            </div>
          ))}
        </div>

        {/* Bottom User/Logout Row */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="size-5 rounded bg-slate-200/60 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-slate-200/60 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* 2. Main Viewport */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header: 72px */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 lg:px-8">
          {/* Mobile hamburger placeholder / Title */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-slate-100 lg:hidden animate-pulse" />
            <div className="h-4 w-36 rounded bg-slate-200/80 animate-pulse" />
          </div>

          {/* Right actions skeleton */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-slate-100 animate-pulse" />
            <div className="size-9 rounded-lg bg-slate-100 animate-pulse" />
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5 rounded-lg py-1 px-1.5">
              <div className="size-9 rounded-full bg-slate-200/90 animate-pulse" />
              <div className="hidden sm:flex flex-col gap-1">
                <div className="h-3.5 w-24 rounded bg-slate-200/80 animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* 3. Page Content Body Skeleton */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 lg:p-8 space-y-6">
          {/* Page Header (Title + Breadcrumbs) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="h-7 w-48 rounded-md bg-slate-200 animate-pulse" />
              <div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
          </div>

          {/* 4 Stats Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs"
              >
                <div className="size-12 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-slate-200/70 animate-pulse" />
                  <div className="h-6 w-16 rounded bg-slate-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Table / Content Area Skeleton */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            {/* Filter / Search toolbar skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100">
              <div className="h-10 w-full sm:w-72 rounded-lg bg-slate-100 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-10 w-28 rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-10 w-28 rounded-lg bg-slate-100 animate-pulse" />
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="space-y-3 pt-2">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 py-3 px-2 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-full bg-slate-200/80 shrink-0 animate-pulse" />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div
                        className="h-3.5 rounded bg-slate-200 animate-pulse"
                        style={{ width: `${40 + (idx % 3) * 15}%` }}
                      />
                      <div
                        className="h-2.5 rounded bg-slate-100 animate-pulse"
                        style={{ width: `${30 + (idx % 2) * 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="hidden md:block h-3.5 w-32 rounded bg-slate-100 animate-pulse" />
                  <div className="h-6 w-20 rounded-full bg-slate-100 animate-pulse" />
                  <div className="size-8 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
