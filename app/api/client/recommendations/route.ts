import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import { generateWorkoutRecommendation, generateQuickWorkout } from "@/server/services/fitness-engine/workout-recommendation";
import { calculateReadinessScore } from "@/server/services/fitness-engine/readiness";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  return traceApiRoute("GET /api/client/recommendations", async () => {
    try {
      const session = await requireAuth();
      const { searchParams } = new URL(request.url);
      const quickMinutes = searchParams.get("quick");

      if (quickMinutes) {
        const minutes = parseInt(quickMinutes, 10);
        if (isNaN(minutes) || minutes < 5 || minutes > 60) {
          return NextResponse.json({ error: "Minutes must be between 5 and 60" }, { status: 400 });
        }
        const quickWorkout = generateQuickWorkout(minutes);
        return NextResponse.json({ quickWorkout });
      }

      const client = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true, fitnessGoal: true, activityLevel: true },
      });

      if (!client) {
        return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
      }

      const completions = await prisma.workoutCompletion.findMany({
        where: { clientProfileId: client.id },
        orderBy: { completedAt: "asc" },
        include: {
          programDay: {
            include: { exercises: { include: { exercise: true } } },
          },
          setLogs: true,
        },
        take: 30,
      });

      const habits = await prisma.habit.findMany({
        where: { userId: session.user.id, isActive: true },
        include: { logs: { orderBy: { date: "desc" }, take: 14 } },
      });

      const latestCheckIn = await prisma.checkIn.findFirst({
        where: { clientProfileId: client.id },
        orderBy: { weekStart: "desc" },
      });

      const history = completions.map((c) => ({
        completedAt: c.completedAt,
        dayTitle: c.programDay.title ?? `Day ${c.programDay.dayNumber}`,
        exercises: c.programDay.exercises.map((pe) => ({
          exerciseId: pe.exercise.id,
          exerciseName: pe.exercise.name,
          muscleGroup: pe.exercise.muscleGroup,
          sets: c.setLogs
            .filter((sl) => sl.programExerciseId === pe.id)
            .map((sl) => ({
              actualReps: sl.actualReps,
              actualWeight: sl.actualWeight,
              completed: sl.completed,
              setNumber: sl.setNumber,
            })),
          completedAt: c.completedAt,
        })),
      }));

      const habitData = habits.flatMap((h) =>
        h.logs.map((log) => ({
          type: h.type,
          value: log.value,
          target: h.target,
          date: log.date,
        })),
      );

      const checkInData = latestCheckIn
        ? {
            energyLevel: latestCheckIn.energyLevel,
            sleepQuality: latestCheckIn.sleepQuality,
            workoutsCompleted: latestCheckIn.workoutsCompleted,
            submittedAt: latestCheckIn.submittedAt,
            weekStart: latestCheckIn.weekStart,
          }
        : null;

      const readiness = calculateReadinessScore(history, habitData, checkInData);

      const recommendation = generateWorkoutRecommendation({
        history,
        habits: habitData,
        readiness,
        goal: client.fitnessGoal,
      });

      return NextResponse.json({ recommendation, readiness });
    } catch (error) {
      logger.error({ err: error, route: "client/recommendations" }, "GET /api/client/recommendations error");

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
