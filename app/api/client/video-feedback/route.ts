import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { submitVideoForFeedback, getVideoFeedback } from "@/server/services/video-feedback.service";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await requireAuth();
    const videos = await getVideoFeedback(session.user.id);
    return NextResponse.json({ videos });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "GET /api/client/video-feedback error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { exerciseName, videoUrl, notes } = await request.json();

    if (!exerciseName || !videoUrl) {
      return NextResponse.json({ error: "Exercise name and video URL are required" }, { status: 400 });
    }

    const result = await submitVideoForFeedback(
      session.user.id,
      videoUrl,
      exerciseName,
      notes,
    );

    return NextResponse.json({ id: result.id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "POST /api/client/video-feedback error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
