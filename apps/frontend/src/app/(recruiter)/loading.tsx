import Image from "next/image";

export default function RecruiterLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/logo.png" alt="JobPlatform" width={48} height={48} priority />
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border/50">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
        <p className="text-xs text-muted">Đang xác thực tài khoản...</p>
      </div>
    </div>
  );
}
