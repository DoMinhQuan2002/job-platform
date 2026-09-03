import { Skeleton } from "@/components/ui/skeleton";

const features = Array.from({ length: 3 });
const fields = Array.from({ length: 4 });

export default function RegisterLoading() {
  return (
    <div
      className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12"
      aria-busy="true"
      aria-label="Đang tải trang đăng ký"
    >
      <section className="hidden flex-col pb-8 pt-8 lg:flex" aria-hidden="true">
        <Skeleton className="mb-6 h-7 w-52 rounded-full" />
        <div className="mb-5 space-y-3">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-11/12 max-w-md" />
          <Skeleton className="h-10 w-3/5 max-w-xs" />
        </div>
        <div className="mb-10 space-y-2">
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-5/6 max-w-md" />
        </div>
        <div className="space-y-6">
          {features.map((_, index) => (
            <div key={index} className="flex items-start gap-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-lg justify-self-end rounded-2xl border border-border/70 bg-white p-6 shadow-sm md:p-10" aria-hidden="true">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="space-y-5">
          {fields.map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 shrink-0 rounded" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </section>
    </div>
  );
}
