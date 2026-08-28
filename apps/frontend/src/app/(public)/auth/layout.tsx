import { Header } from "@/components/layout/header";
import { RouteFooter } from "@/components/layout/RouteFooter";
import type { ReactNode } from "react";

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header></Header>
      <main id="auth-content" className="flex-1">
        {children}
      </main>
      <RouteFooter></RouteFooter>
    </div>
  );
}
