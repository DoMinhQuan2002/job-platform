import { Skeleton } from "@/components/ui/skeleton";

const features = Array.from({ length: 3 });

export default function LoginLoading() {
  return (
    <div
      className="container mx-auto grid w-full grid-cols-1 items-start gap-8 px-4 py-8 md:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12"
      aria-busy="true"
      aria-label="Đang tải trang đăng nhập"
    >
      <section className="hidden flex-col pb-8 pt-8 lg:flex" aria-hidden="true">
        <div className="mb-6 space-y-3">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-4/5 max-w-sm" />
        </div>
        <div className="mb-10 space-y-2">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-4/5 max-w-sm" />
        </div>
        <div className="space-y-7">
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

      <section className="w-full max-w-126 justify-self-end rounded-2xl border border-border/70 bg-white px-6 py-10 shadow-sm sm:px-12 sm:py-12" aria-hidden="true">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-5">
          {["email", "password"].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="my-6 flex items-center gap-4">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-px flex-1" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="mt-8 flex justify-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </section>
    </div>
  );
}
