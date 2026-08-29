import { Skeleton } from "@/components/ui/skeleton";
import {
  AuthSkeletonField,
  AuthSkeletonHeading,
  AuthSkeletonShell,
} from "../_components/auth-skeleton-shell";

export default function LoginLoading() {
  return (
    <AuthSkeletonShell
      label="Đang tải trang đăng nhập"
      cardClassName="max-w-126 px-6 py-10 sm:px-12 sm:py-12"
    >
      <AuthSkeletonHeading />
      <div className="space-y-5">
        <AuthSkeletonField labelWidth="w-14" />
        <AuthSkeletonField labelWidth="w-20" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-px flex-1" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
      <div className="mt-6 flex justify-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    </AuthSkeletonShell>
  );
}
