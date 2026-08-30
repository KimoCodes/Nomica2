"use client";

import Image from "next/image";
import { useState } from "react";
import { subscribeToEarlyAccess } from "@/actions/coming-soon.actions";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("email", email);
      const result = await subscribeToEarlyAccess(formData);

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 py-12">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <Image
            src="/logo2.png"
            alt="NomiTips"
            width={320}
            height={100}
            className="h-auto w-[220px] sm:w-[280px] md:w-[320px]"
            priority
          />
        </div>

        {/* Heading */}
        <div className="mb-6 space-y-4 animate-slide-up stagger-1">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Be the First to Know
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-neutral-400">
            We&apos;re crafting a premium fitness experience built for women who
            want real results. Launch is coming soon.
          </p>
        </div>

        {/* Early access badge */}
        <div className="mb-8 animate-slide-up stagger-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
            <div className="size-1.5 rounded-full bg-primary animate-pulse-subtle" />
            <span className="text-sm font-medium text-primary">
              Early Access — Limited Spots
            </span>
          </div>
        </div>

        {/* Email signup */}
        <div className="w-full animate-slide-up stagger-3">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  You&apos;re on the list!
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  We&apos;ll notify you the moment we launch. Check your inbox
                  for a welcome surprise.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              <p className="text-xs text-neutral-500">
                Join early and receive an{" "}
                <span className="text-primary/80 font-medium">
                  exclusive launch reward
                </span>{" "}
                when we go live. No spam, ever.
              </p>
            </form>
          )}
        </div>

        {/* Features teaser */}
        <div className="mt-14 grid w-full max-w-sm grid-cols-3 gap-6 animate-slide-up stagger-4">
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg
                className="size-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <span className="text-xs text-neutral-500">Programs</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg
                className="size-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
            <span className="text-xs text-neutral-500">Coaching</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <svg
                className="size-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                />
              </svg>
            </div>
            <span className="text-xs text-neutral-500">Nutrition</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center gap-2 animate-fade-in stagger-5">
          <span className="text-xs tracking-widest text-neutral-600 uppercase">
            NomiTips — est. 2026
          </span>
        </div>
      </div>
    </div>
  );
}
