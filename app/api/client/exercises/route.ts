import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import { searchExercises, generateSurpriseWorkout } from "@/server/services/fitness-engine/exercise-search";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  return traceApiRoute("GET /api/client/exercises", async () => {
    try {
      await requireAuth();
      const { searchParams } = new URL(request.url);

      const action = searchParams.get("action");

      if (action === "surprise") {
        const minutes = parseInt(searchParams.get("minutes") ?? "30", 10);
        const equipment = searchParams.get("equipment") ?? "none";
        const level = searchParams.get("level") ?? "BEGINNER";
        const goal = searchParams.get("goal") ?? null;

        const workout = generateSurpriseWorkout({
          availableMinutes: minutes,
          equipment,
          fitnessLevel: level,
          goal,
        });

        return NextResponse.json({ workout });
      }

      const filters = {
        muscleGroup: searchParams.get("muscle") ?? undefined,
        equipment: searchParams.get("equipment") ?? undefined,
        difficulty: searchParams.get("difficulty") ?? undefined,
        maxDuration: searchParams.get("maxDuration") ? parseInt(searchParams.get("maxDuration")!, 10) : undefined,
        goal: searchParams.get("goal") ?? undefined,
        location: searchParams.get("location") ?? undefined,
      };

      const exercises = searchExercises(filters);
      return NextResponse.json({ exercises, count: exercises.length });
    } catch (error) {
      logger.error({ err: error, route: "client/exercises" }, "GET /api/client/exercises error");

      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
