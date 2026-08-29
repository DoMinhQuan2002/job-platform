import { Skeleton } from "@/components/ui/skeleton";

export default function ForgotPasswordLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-220px)] items-center justify-center px-4 py-8 md:px-8"
      aria-busy="true"
      aria-label="Đang tải trang quên mật khẩu"
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] md:grid-cols-[0.8fr_1.2fr]">
        <section className="hidden min-h-140 bg-primary/5 p-10 md:flex md:flex-col md:justify-between" aria-hidden="true">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
        </section>

        <section className="flex min-h-140 flex-col justify-center p-6 sm:p-10 lg:p-16" aria-hidden="true">
          <Skeleton className="mb-8 h-7 w-24 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <div className="mb-7 mt-3 space-y-2">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-3/4 max-w-sm" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <Skeleton className="mx-auto mt-7 h-4 w-36" />
        </section>
      </div>
    </div>
  );
}
