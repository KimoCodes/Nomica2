import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LoadingBarProvider } from "@/components/ui/loading-bar";
import { Providers } from "@/components/providers";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { ThemeInjector } from "@/components/theme-injector";

export const runtime = "nodejs";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NomiTips",
    template: "%s | NomiTips",
  },
  description:
    "NomiTips — Personalized fitness coaching with custom workout programs, nutrition tracking, and 1-on-1 coaching for women building strength and confidence.",
  keywords: ["fitness coaching", "workout programs", "nutrition tracking", "personal trainer", "women fitness", "strength training"],
  authors: [{ name: "NomiTips" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NomiTips",
    title: "NomiTips — Personalized Fitness Coaching",
    description: "Custom workout programs, nutrition tracking, and 1-on-1 coaching for women building strength and confidence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NomiTips — Personalized Fitness Coaching",
    description: "Custom workout programs, nutrition tracking, and 1-on-1 coaching for women building strength and confidence.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeInjector />
        <Providers>
          <VisitTracker />
          <LoadingBarProvider>
            {children}
          </LoadingBarProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
