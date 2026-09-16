import { NextRequest, NextResponse } from "next/server";
import { trackPageVisit } from "@/server/services/analytics.service";
import { checkRateLimit, getClientIp } from "@/server/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const { allowed, retryAfterMs } = checkRateLimit(`analytics:${ip}`, 30, 60_000);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
      );
    }

    const body = await request.json();
    const { path, sessionId, referrer } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    // Sanitize path — prevent injection of arbitrary data
    const sanitizedPath = path.slice(0, 500);

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;

    // Do NOT accept userId from the client — analytics tracking is anonymous
    await trackPageVisit({
      path: sanitizedPath,
      userId: null,
      sessionId: sessionId ?? null,
      ipAddress,
      userAgent,
      referrer: referrer ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
