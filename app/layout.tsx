import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LoadingBarProvider } from "@/components/ui/loading-bar";

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
    default: "NOMICA",
    template: "%s | NOMICA",
  },
  description:
    "NOMICA — Personalized fitness coaching with custom workout programs, nutrition tracking, and 1-on-1 coaching for women building strength and confidence.",
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
        <LoadingBarProvider>
          {children}
        </LoadingBarProvider>
        <Toaster />
      </body>
    </html>
  );
}
