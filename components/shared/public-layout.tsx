"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dumbbell, Menu, X } from "lucide-react";

type PublicLayoutProps = {
  children: ReactNode;
};

const navLinks = [
  { label: "Programs", href: "/programs" },
  { label: "Bundles", href: "/bundles" },
  { label: "Club", href: "/club" },
  { label: "Results", href: "/transformations" },
  { label: "Pricing", href: "/pricing" },
] as const;

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only z-[100] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-lg"
      >
        Skip to content
      </a>

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-card/50 px-4 backdrop-blur-sm md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">NoMica</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isActive(link.href) && "bg-muted text-foreground font-medium",
              )}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: "sm" })}
            >
              Get started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex size-9 items-center justify-center rounded-lg md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 flex h-full w-72 flex-col bg-card shadow-premium-lg animate-slide-in-right">
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <Dumbbell className="size-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">NoMica</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                    isActive(link.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground",
                  )}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2 border-t border-border/50 p-4">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-center",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants(), "w-full justify-center")}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}

      {children}

      <footer className="shrink-0 border-t border-border/50 bg-card/50 px-4 py-12 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="size-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold">NoMica</span>
              </Link>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Premium feminine transformation fitness. Structured programs,
                progressive overload science, and real coach support.
              </p>
            </div>

            {/* Programs */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Programs
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/programs"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    All Programs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bundles"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Bundles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/club"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sculpt Club
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/transformations"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Results
                  </Link>
                </li>
                <li>
                  <Link
                    href="/quiz"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Take the Quiz
                  </Link>
                </li>
                <li>
                  <Link
                    href="/free-guide"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Free Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@nomica.app"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    support@nomica.app
                  </a>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} NoMica. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                TikTok
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
