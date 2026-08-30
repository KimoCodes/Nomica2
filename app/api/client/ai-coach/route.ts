import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAiCoachResponse, saveAiConversation, getAiConversationHistory } from "@/server/services/ai-coach.service";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await requireAuth();
    const history = await getAiConversationHistory(session.user.id);
    return NextResponse.json({ history });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "GET /api/client/ai-coach error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await getAiCoachResponse(
      session.user.id,
      message,
      history || [],
    );

    await saveAiConversation(session.user.id, message, response);

    return NextResponse.json({ response });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "POST /api/client/ai-coach error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
