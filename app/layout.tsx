import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Suspense } from "react";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "نور گالری | نمایشگاه لوستر و روشنایی",
    template: "%s | نور گالری",
  },
  description:
    "نمایشگاه تخصصی لوستر، لامپ و روشنایی معماری — مجموعه‌های منتخب با طراحی شیک و تجربه‌ای لوکس.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} dark overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="flex min-h-svh max-w-full flex-col overflow-x-hidden">
        <Providers>
          <SiteChrome
            header={
              <Suspense fallback={null}>
                <SiteHeader />
              </Suspense>
            }
            footer={
              <Suspense fallback={null}>
                <SiteFooter />
              </Suspense>
            }
          >
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
