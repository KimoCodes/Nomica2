import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Admin & Coach Login",
  description: "Sign in to the NomiTips administrator or coach dashboard.",
};

const CORNER_BRACKETS = [
  "top-2 left-2 border-t border-l",
  "top-2 right-2 border-t border-r",
  "bottom-2 left-2 border-b border-l",
  "bottom-2 right-2 border-b border-r",
] as const;

const BRIEFING_POINTS = [
  "Science-backed progressive overload programs",
  "Structured workouts with step-by-step exercise instructions",
  "Real coach feedback and support",
];

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(15,16,19,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(15,16,19,0.9) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

export default function StaffLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <header className="relative z-20 shrink-0">
        <div className="flex items-center justify-between bg-[#0f1013] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase sm:px-6">
          <span className="flex items-center gap-2">
            <span aria-hidden className="mach-led size-1.5 rounded-full bg-emerald-400" />
            Restricted · Staff Access Only
          </span>
          <span className="hidden text-slate-500 sm:inline">Gate 01 — Lvl 3</span>
        </div>
        <div
          aria-hidden
          className="h-px bg-gradient-to-r from-primary/60 via-primary/20 to-primary/60"
        />
      </header>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={GRID_STYLE}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 to-transparent"
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <section className="relative hidden overflow-hidden rounded-xl border border-white/10 bg-[#0f1013] shadow-premium-lg lg:block">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase">
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-400/80" />
                System Briefing
              </span>
              <span>NT-CORE</span>
            </div>
            <div className="relative p-8">
              {CORNER_BRACKETS.map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`pointer-events-none absolute ${pos} size-3 border-primary/30`}
                />
              ))}

              <div className="relative aspect-[16/5] w-[200px]">
                <Image
                  src="/logo2.png"
                  alt="NomiTips"
                  fill
                  sizes="200px"
                  className="object-cover"
                  style={{ objectPosition: "center 38%" }}
                  priority
                />
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight text-white xl:text-4xl">
                Personal coaching{" "}
                <span className="text-gradient">that fits your life</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Connect with expert coaches, follow personalized programs, and
                achieve your fitness goals.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-slate-400">
                {BRIEFING_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2.5">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-premium-lg lg:mx-0 lg:max-w-none">
            <div className="flex items-center justify-between bg-[#0f1013] px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase sm:px-5">
              <span className="flex items-center gap-2">
                <span aria-hidden className="mach-led size-1.5 rounded-full bg-emerald-400" />
                Staff Access Terminal
              </span>
              <span className="hidden text-slate-500 sm:inline">Secure Gate</span>
            </div>
            <div
              aria-hidden
              className="h-px bg-gradient-to-r from-primary/70 via-primary/25 to-transparent"
            />

            <div className="relative p-5 sm:p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={GRID_STYLE}
              />
              {CORNER_BRACKETS.map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`pointer-events-none absolute ${pos} size-3 border-primary/40`}
                />
              ))}

              <div className="relative mb-6 flex justify-center lg:hidden">
                <Image
                  src="/logo2.png"
                  alt="NomiTips"
                  width={160}
                  height={56}
                  className="h-11 w-auto"
                  priority
                />
              </div>

              <Suspense>
                <LoginForm staffLogin />
              </Suspense>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-20 shrink-0">
        <div
          aria-hidden
          className="h-px bg-gradient-to-r from-primary/60 via-primary/20 to-primary/60"
        />
        <div className="flex items-center justify-between bg-[#0f1013] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase sm:px-6">
          <span>Session Monitored · Audit Log Active</span>
          <span className="hidden sm:inline">NomiTips Platform</span>
        </div>
      </footer>
    </div>
  );
}
