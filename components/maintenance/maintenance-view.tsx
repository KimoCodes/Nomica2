"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RefreshCw } from "lucide-react";
import { StaffLoginLink } from "@/components/shared/staff-login-link";

const POLL_INTERVAL_MS = 20_000;
const SEGMENT_COUNT = 32;
const TICK_COUNT = 48;

const DIAGNOSTICS: Array<{ label: string; value: string; tone: string }> = [
  { label: "DATABASE LINK", value: "HEALTHY", tone: "text-emerald-400" },
  { label: "CONTENT PIPELINE", value: "REBUILDING", tone: "text-amber-400" },
  { label: "EDGE CACHE", value: "FLUSHING", tone: "text-amber-400" },
  { label: "SESSION SERVICE", value: "PAUSED", tone: "text-slate-400" },
];

function polar(cx: number, cy: number, r: number, angle: number): string {
  return `${(cx + Math.cos(angle) * r).toFixed(2)} ${(cy + Math.sin(angle) * r).toFixed(2)}`;
}

function gearPath(teeth: number, tipRadius: number, rootRadius: number): string {
  const cx = 100;
  const cy = 100;
  const step = (Math.PI * 2) / teeth;
  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    points.push(polar(cx, cy, rootRadius, a - step * 0.3));
    points.push(polar(cx, cy, tipRadius, a - step * 0.16));
    points.push(polar(cx, cy, tipRadius, a + step * 0.16));
    points.push(polar(cx, cy, rootRadius, a + step * 0.3));
    points.push(polar(cx, cy, rootRadius, a + step * 0.5));
  }

  const holeR = 16;
  const hole = [
    `M ${cx - holeR} ${cy}`,
    `A ${holeR} ${holeR} 0 1 0 ${cx + holeR} ${cy}`,
    `A ${holeR} ${holeR} 0 1 0 ${cx - holeR} ${cy}`,
    "Z",
  ].join(" ");

  return `M ${points[0]} L ${points.slice(1).join(" L ")} Z ${hole}`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hms = [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
  return days > 0 ? `${days}d ${hms}` : hms;
}

function formatUtcClock(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s} UTC`;
}

let clockSnapshot: Date | null = null;

function subscribeToClock(onChange: () => void): () => void {
  clockSnapshot = new Date();
  const id = window.setInterval(() => {
    clockSnapshot = new Date();
    onChange();
  }, 1000);
  return () => window.clearInterval(id);
}

function getClockSnapshot(): Date {
  if (!clockSnapshot) clockSnapshot = new Date();
  return clockSnapshot;
}

function getServerClockSnapshot(): Date | null {
  return null;
}

export function MaintenanceView({
  headline,
  message,
  returnAt,
}: {
  headline: string;
  message: string;
  returnAt: string | null;
}) {
  const [phase, setPhase] = useState<"maintenance" | "restored">("maintenance");
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const redirectingRef = useRef(false);

  const clock = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);

  const checkStatus = useCallback(async () => {
    if (redirectingRef.current) return;
    setChecking(true);
    try {
      const res = await fetch("/api/public/site-status", { cache: "no-store" });
      setLastCheck(new Date());
      if (!res.ok) return;
      const data: { mode?: string } = await res.json();
      if (data.mode === "NORMAL" || data.mode === "COMING_SOON") {
        redirectingRef.current = true;
        setPhase("restored");
        const target = data.mode === "NORMAL" ? "/" : "/coming-soon";
        window.setTimeout(() => {
          window.location.assign(target);
        }, 1400);
      }
    } catch {
      // Transient network failure — keep polling.
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) void checkStatus();
    }, POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (!document.hidden) void checkStatus();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [checkStatus]);

  const returnDate = returnAt ? new Date(returnAt) : null;
  const countdown =
    returnDate && clock && Number.isFinite(returnDate.getTime())
      ? formatCountdown(returnDate.getTime() - clock.getTime())
      : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0b0e] text-slate-200">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08),_transparent_55%)]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="relative aspect-[16/5] w-[140px] sm:w-[180px]">
          <Image
            src="/logo2.png"
            alt="NomiTips"
            fill
            sizes="(min-width: 640px) 180px, 140px"
            className="object-cover"
            style={{ objectPosition: "center 38%" }}
            priority
          />
        </div>
        <StaffLoginLink className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 pb-10 sm:px-8">
        <div
          role="status"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-amber-400 uppercase"
        >
          <span className="mach-led size-1.5 rounded-full bg-amber-400" />
          {phase === "restored" ? "Service Restored" : "Maintenance Mode"}
        </div>

        <div className="relative mt-6 size-[240px] sm:size-[280px]">
          <svg
            viewBox="0 0 200 200"
            className="size-full"
            role="img"
            aria-label="System maintenance indicator"
          >
            <defs>
              <linearGradient id="machSweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.45" />
              </linearGradient>
              <radialGradient id="machHub" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#27292f" />
                <stop offset="100%" stopColor="#131418" />
              </radialGradient>
            </defs>

            <circle cx="100" cy="100" r="96" fill="#101116" stroke="#2a2c33" strokeWidth="1.5" />

            <g>
              {Array.from({ length: TICK_COUNT }, (_, i) => {
                const major = i % 4 === 0;
                const angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
                const inner = major ? 84 : 89;
                return (
                  <line
                    key={i}
                    x1={100 + Math.cos(angle) * inner}
                    y1={100 + Math.sin(angle) * inner}
                    x2={100 + Math.cos(angle) * 93}
                    y2={100 + Math.sin(angle) * 93}
                    stroke={major ? "#5b5f6a" : "#33363e"}
                    strokeWidth={major ? 1.6 : 0.9}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            <g className="mach-rotor mach-radar">
              <path d="M 100 100 L 100 18 A 82 82 0 0 1 171 59 Z" fill="url(#machSweep)" />
            </g>

            <circle cx="100" cy="100" r="74" fill="none" stroke="#23252c" strokeWidth="1" />

            <g className="mach-rotor mach-spin">
              <path
                d={gearPath(16, 72, 60)}
                fill="#1a1c22"
                stroke="#4d525e"
                strokeWidth="1.2"
                fillRule="evenodd"
              />
            </g>

            <g className="mach-rotor mach-spin-reverse">
              <polygon
                points="100,70 126,85 126,115 100,130 74,115 74,85"
                fill="#22252c"
                stroke="#6b7280"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="100" r="17" fill="url(#machHub)" stroke="#3f4450" strokeWidth="1" />
              <circle className="mach-led" cx="100" cy="100" r="6" fill="#f59e0b" />
              <circle cx="100" cy="100" r="6" fill="none" stroke="#fcd34d" strokeWidth="0.8" opacity="0.7" />
            </g>

            <circle cx="100" cy="100" r="96" fill="none" stroke="#3a3d46" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="mt-7 text-center font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {headline}
        </h1>
        <p className="mt-3 max-w-xl text-center text-sm leading-relaxed text-slate-400 sm:text-base">
          {message}
        </p>

        <section className="relative mt-8 w-full overflow-hidden rounded-lg border border-white/10 bg-[#101116]/90">
          <div className="mach-hazard h-1.5 w-full" />
          <div className="mach-scan pointer-events-none absolute right-0 left-0 h-16 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent" />

          <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase sm:px-5">
            <span>Control Console — Diagnostics</span>
            <span className="hidden sm:inline">UNIT NT-01</span>
          </div>

          <div className="relative space-y-2.5 px-4 py-4 font-mono text-xs sm:px-5 sm:text-[13px]">
            {DIAGNOSTICS.map((row) => (
              <div key={row.label} className="flex items-baseline gap-2">
                <span className="shrink-0 text-slate-400">{row.label}</span>
                <span
                  aria-hidden
                  className="min-w-6 flex-1 translate-y-[-3px] border-b border-dotted border-slate-700"
                />
                <span className={`shrink-0 font-semibold ${row.tone}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-1 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2">
            <div className="bg-[#101116] px-4 py-3.5 sm:px-5">
              <div className="font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                Scheduled Return
              </div>
              <div className="mt-1.5 font-mono text-xl font-bold text-amber-400 tabular-nums sm:text-2xl">
                {countdown ?? "MANUAL"}
              </div>
              <div className="mt-1 font-mono text-[10px] text-slate-600">
                {returnDate && Number.isFinite(returnDate.getTime())
                  ? returnDate.toUTCString().replace("GMT", "UTC")
                  : "NO RETURN TIME SET"}
              </div>
            </div>
            <div className="bg-[#101116] px-4 py-3.5 sm:px-5">
              <div className="font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                Last Check
              </div>
              <div className="mt-1.5 font-mono text-xl font-bold text-slate-300 tabular-nums sm:text-2xl">
                {lastCheck ? formatUtcClock(lastCheck) : "—"}
              </div>
              <div className="mt-1 font-mono text-[10px] text-slate-600">
                AUTO-REFRESH EVERY 20S
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-3 border-t border-white/10 px-4 py-3.5 sm:px-5">
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase sm:inline">
              Bus Load
            </span>
            <div aria-hidden className="flex flex-1 gap-[3px]">
              {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
                <span
                  key={i}
                  className={`mach-seg h-3 flex-1 rounded-[1px] ${
                    i < 10
                      ? "bg-emerald-500/80"
                      : i < 22
                        ? "bg-amber-500/80"
                        : "bg-slate-700"
                  }`}
                  style={{ animationDelay: `${(i * 2.2) / SEGMENT_COUNT}s` }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => void checkStatus()}
              disabled={checking || phase === "restored"}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] tracking-wide text-slate-300 transition-colors hover:border-amber-500/40 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`size-3 ${checking ? "animate-spin" : ""}`} />
              Recheck
            </button>
          </div>

          {[
            "top-1.5 left-1.5",
            "top-1.5 right-1.5",
            "bottom-1.5 left-1.5",
            "bottom-1.5 right-1.5",
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`pointer-events-none absolute ${pos} size-3 border-amber-500/50`}
              style={{
                borderTopWidth: pos.includes("top") ? 1.5 : 0,
                borderBottomWidth: pos.includes("bottom") ? 1.5 : 0,
                borderLeftWidth: pos.includes("left") ? 1.5 : 0,
                borderRightWidth: pos.includes("right") ? 1.5 : 0,
              }}
            />
          ))}
        </section>

        <p className="mt-6 font-mono text-[11px] tracking-wide text-slate-600">
          Please check back shortly — we&apos;ll be back soon.
        </p>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-5 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em] text-slate-600 uppercase sm:flex-row">
          <span>
            SYS TIME{" "}
            <span className="text-slate-400 tabular-nums">
              {clock ? formatUtcClock(clock) : "--:--:-- UTC"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${
                phase === "restored" ? "bg-emerald-400" : "mach-led bg-amber-400"
              }`}
            />
            {phase === "restored" ? "REDIRECTING…" : "AUTO-REFRESH ACTIVE"}
          </span>
          <span>NOMITIPS PLATFORM</span>
        </div>
      </footer>
    </div>
  );
}
