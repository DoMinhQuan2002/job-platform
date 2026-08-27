const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-border/45 ${className}`} />
);

export function RecruiterJobsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5" aria-label="Đang tải danh sách tin tuyển dụng" aria-busy="true">
      <header className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3 w-80 max-w-full" />
      </header>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-4 lg:flex-row lg:items-center">
          <div className="flex gap-3 overflow-hidden">
            {["w-16", "w-20", "w-20", "w-20", "w-16", "w-14", "w-20"].map((width, index) => (
              <Skeleton key={index} className={`h-8 shrink-0 ${width}`} />
            ))}
          </div>
          <div className="flex gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-28" /></div>
        </div>

        <div className="overflow-hidden">
          <div className="grid min-w-[900px] grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_80px_150px] gap-4 border-b border-border bg-background px-5 py-4">
            {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-3 w-4/5" />)}
          </div>
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} className="grid min-w-[900px] grid-cols-[60px_2fr_1fr_1fr_1fr_1fr_80px_150px] items-center gap-4 border-b border-border px-5 py-4">
              <Skeleton className="h-3 w-5" />
              <div className="space-y-2"><Skeleton className="h-3.5 w-4/5" /><Skeleton className="h-2.5 w-20" /></div>
              <Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="mx-auto h-3 w-5" />
              <div className="flex gap-2">{Array.from({ length: 4 }).map((__, index) => <Skeleton key={index} className="size-7 rounded-full" />)}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between p-4"><Skeleton className="h-3 w-48" /><Skeleton className="h-8 w-40" /></div>
      </section>

      <div className="flex gap-4 rounded-lg border border-primary/10 bg-primary/5 p-5">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /></div>
      </div>
    </div>
  );
}
