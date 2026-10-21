import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedCatalogProductIds } from "@/server/services/entitlement.service";
import { buildVideoDeliveryUrl } from "@/server/services/video-delivery.service";
import { isVideoGuidedWorkoutsEnabled } from "@/server/services/admin.service";

export const runtime = "nodejs";

/**
 * GET /api/media/videos/[exerciseId]
 *
 * Entitlement-checked video delivery. Clients receive a short-lived signed
 * URL for Cloudinary-hosted videos (or a redirect to public external links
 * such as YouTube). Raw storage URLs are never embedded in page payloads;
 * every playback resolves through this gate.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { exerciseId } = await params;
  if (!exerciseId || exerciseId.length > 100) {
    return NextResponse.json({ error: "Invalid exercise" }, { status: 400 });
  }

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "COACH";

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { videoUrl: true },
  });
  if (!exercise?.videoUrl) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (!isStaff) {
    // Admin switch: when video-guided workouts are off, delivery is off
    // for clients (videos are an optional convenience, never required).
    if (!(await isVideoGuidedWorkoutsEnabled())) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    // Same access rule as the entitled exercise library: any lifetime
    // catalog ownership or an active coach-assigned program.
    const [ownedIds, assignment] = await Promise.all([
      getOwnedCatalogProductIds(session.user.id),
      prisma.clientProgram.findFirst({
        where: { clientProfile: { userId: session.user.id }, isActive: true },
        select: { id: true },
      }),
    ]);
    if (ownedIds.length === 0 && !assignment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const url = buildVideoDeliveryUrl(exercise.videoUrl);
  if (!url) {
    return NextResponse.json({ error: "Video unavailable" }, { status: 404 });
  }

  return NextResponse.redirect(url, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
