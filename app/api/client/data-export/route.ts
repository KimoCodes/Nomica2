import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET() {
  return traceApiRoute("GET /api/client/data-export", async () => {
    try {
      const session = await requireAuth();

      const profile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          workoutCompletions: {
            include: {
              programDay: { include: { exercises: { include: { exercise: true } } } },
              setLogs: true,
            },
          },
          checkIns: true,
          progressLogs: true,
          programs: { include: { program: true } },
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      const habits = await prisma.habit.findMany({
        where: { userId: session.user.id },
        include: { logs: true },
      });

      const mealLogs = await prisma.mealLog.findMany({
        where: { clientProfileId: profile.id },
        include: { items: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, createdAt: true },
      });

      const exportData = {
        exportDate: new Date().toISOString(),
        user,
        profile: {
          fitnessGoal: profile.fitnessGoal,
          activityLevel: profile.activityLevel,
          equipment: profile.equipment,
          height: profile.height,
          weight: profile.weight,
        },
        workoutCompletions: profile.workoutCompletions.map((wc) => ({
          completedAt: wc.completedAt,
          dayTitle: wc.programDay.title,
          notes: wc.notes,
          exercises: wc.programDay.exercises.map((pe) => ({
            name: pe.exercise.name,
            muscleGroup: pe.exercise.muscleGroup,
          })),
          sets: wc.setLogs.map((sl) => ({
            setNumber: sl.setNumber,
            actualReps: sl.actualReps,
            actualWeight: sl.actualWeight,
            completed: sl.completed,
          })),
        })),
        habits: habits.map((h) => ({
          type: h.type,
          target: h.target,
          logs: h.logs.map((l) => ({
            date: l.date,
            value: l.value,
            notes: l.notes,
          })),
        })),
        checkIns: profile.checkIns.map((ci) => ({
          weekStart: ci.weekStart,
          energyLevel: ci.energyLevel,
          sleepQuality: ci.sleepQuality,
          workoutsCompleted: ci.workoutsCompleted,
          currentWeight: ci.currentWeight,
        })),
        progressLogs: profile.progressLogs.map((pl) => ({
          loggedAt: pl.loggedAt,
          weight: pl.weight,
          bodyFat: pl.bodyFat,
          notes: pl.notes,
        })),
        mealLogs: mealLogs.map((ml) => ({
          loggedAt: ml.loggedAt,
          mealType: ml.mealType,
          items: ml.items.map((item) => ({
            foodName: item.foodName,
            portionGrams: item.portionGrams,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          })),
        })),
      };

      return NextResponse.json(exportData, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="nomitips-data-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    } catch (error) {
      logger.error({ err: error, route: "client/data-export" }, "GET /api/client/data-export error");

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
