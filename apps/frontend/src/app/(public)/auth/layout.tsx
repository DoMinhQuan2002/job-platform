import type { ReactNode } from "react";

type LayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col bg-background">
      <main id="auth-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
