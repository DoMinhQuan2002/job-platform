import { Skeleton } from "@/components/ui/skeleton";
import {
  AuthSkeletonHeading,
  AuthSkeletonShell,
} from "../_components/auth-skeleton-shell";

const otpDigits = Array.from({ length: 6 });

export default function VerifyOtpLoading() {
  return (
    <AuthSkeletonShell label="Đang tải trang xác thực OTP">
      <AuthSkeletonHeading descriptionWidth="w-64" />
      <div className="flex justify-center">
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="mt-8 space-y-5">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {otpDigits.map((_, index) => (
            <Skeleton key={index} className="aspect-square min-w-0 rounded-lg" />
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-px flex-1" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </AuthSkeletonShell>
  );
}
