import { Skeleton } from "@/components/ui/skeleton";
import {
  AuthSkeletonField,
  AuthSkeletonHeading,
  AuthSkeletonShell,
} from "../_components/auth-skeleton-shell";

const fields = Array.from({ length: 4 });

export default function RegisterLoading() {
  return (
    <AuthSkeletonShell label="Đang tải trang đăng ký">
      <AuthSkeletonHeading />
      <div className="space-y-5">
        {fields.map((_, index) => (
          <AuthSkeletonField key={index} />
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
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="mt-6 flex justify-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </AuthSkeletonShell>
  );
}
