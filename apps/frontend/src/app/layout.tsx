import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { RouteFooter } from "@/components/layout/RouteFooter";
import { Header } from "@/components/layout/header";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

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
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>

      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Toaster position="top-right" richColors />
        <RouteFooter></RouteFooter>
      </body>
    </html>
  );
}
