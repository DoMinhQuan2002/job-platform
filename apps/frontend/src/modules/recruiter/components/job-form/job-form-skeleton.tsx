const Line = ({ className }: { className: string }) => <div className={`animate-pulse rounded bg-border/45 ${className}`} />;

export function JobFormSkeleton() {
  return <div className="mx-auto max-w-6xl space-y-5" aria-busy="true"><Line className="h-4 w-24" /><Line className="h-7 w-64" /><Line className="h-3 w-96 max-w-full" /><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 10 }).map((_, index) => <div key={index} className={index === 0 || index > 7 ? "sm:col-span-2" : ""}><Line className="mb-2 h-3 w-28" /><Line className={index > 7 ? "h-36 w-full" : "h-10 w-full"} /></div>)}</div><div className="space-y-4"><Line className="h-40 w-full" /><Line className="h-80 w-full" /></div></div></div>;
}
