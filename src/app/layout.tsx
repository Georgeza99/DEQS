import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "DEQS | نظام إدارة ديون المحل",
  description: "إدارة الزبائن والديون بسهولة وأمان",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
