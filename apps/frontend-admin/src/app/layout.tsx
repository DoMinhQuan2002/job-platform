import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Job Platform - Hệ thống quản trị",
  description: "Bảng điều khiển quản trị hệ thống Job Platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${hankenGrotesk.variable} h-full antialiased`}>
      <body className="h-full antialiased bg-background text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
