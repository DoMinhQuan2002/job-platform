import type { Metadata } from "next";
import "./globals.css";
import { MainNav } from "@/components/layout/main-nav";

export const metadata: Metadata = {
  title: "Job Platform",
  description: "Job platform frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <MainNav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
