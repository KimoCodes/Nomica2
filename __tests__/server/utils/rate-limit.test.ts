import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, getClientIp } from "@/server/utils/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  it("allows first request", () => {
    const result = checkRateLimit("test:1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("allows requests within limit", () => {
    for (let i = 0; i < 4; i++) {
      const result = checkRateLimit("test:2", 5, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks request at limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:3", 5, 60_000);
    }
    const result = checkRateLimit("test:3", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:4", 5, 60_000);
    }
    const blocked = checkRateLimit("test:4", 5, 60_000);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    const allowed = checkRateLimit("test:4", 5, 60_000);
    expect(allowed.allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:a", 5, 60_000);
    }
    const blocked = checkRateLimit("test:a", 5, 60_000);
    expect(blocked.allowed).toBe(false);

    const allowed = checkRateLimit("test:b", 5, 60_000);
    expect(allowed.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("returns unknown for empty headers", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });

  it("extracts IP from x-forwarded-for", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "1.2.3.4, 5.6.7.8");
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("extracts IP from x-real-ip", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "9.8.7.6");
    expect(getClientIp(headers)).toBe("9.8.7.6");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "1.2.3.4");
    headers.set("x-real-ip", "9.8.7.6");
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });
});
