import { NextResponse } from "next/server";
import { getEffectiveAccessMode } from "@/lib/site-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: {
        websiteAccessMode: true,
        comingSoonAutoSwitch: true,
        comingSoonLaunchAt: true,
        maintenanceReturnAt: true,
      },
    });

    const mode = getEffectiveAccessMode(settings);

    return NextResponse.json(
      {
        mode,
        maintenanceReturnAt: settings?.maintenanceReturnAt?.toISOString() ?? null,
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { mode: "UNKNOWN", maintenanceReturnAt: null, timestamp: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
