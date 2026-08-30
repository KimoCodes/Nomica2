import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { traceApiRoute } from "@/lib/sentry-tracing";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function DELETE() {
  return traceApiRoute("DELETE /api/client/account", async () => {
    try {
      const session = await requireAuth();

      const profile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.mealLogItem.deleteMany({
          where: { mealLog: { clientProfileId: profile.id } },
        });
        await tx.mealLog.deleteMany({
          where: { clientProfileId: profile.id },
        });
        await tx.workoutSetLog.deleteMany({
          where: { workoutCompletion: { clientProfileId: profile.id } },
        });
        await tx.workoutCompletion.deleteMany({
          where: { clientProfileId: profile.id },
        });
        await tx.habitLog.deleteMany({
          where: { habit: { userId: session.user.id } },
        });
        await tx.habit.deleteMany({
          where: { userId: session.user.id },
        });
        await tx.checkIn.deleteMany({
          where: { clientProfileId: profile.id },
        });
        await tx.progressLog.deleteMany({
          where: { clientProfileId: profile.id },
        });
        await tx.message.deleteMany({
          where: { conversation: { clientId: session.user.id } },
        });
        await tx.conversation.deleteMany({
          where: { clientId: session.user.id },
        });
        await tx.clientProgram.deleteMany({
          where: { clientProfileId: profile.id },
        });
        await tx.clientProfile.delete({
          where: { id: profile.id },
        });
        await tx.user.delete({
          where: { id: session.user.id },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Your account and all associated data have been permanently deleted.",
      });
    } catch (error) {
      logger.error({ err: error, route: "client/account" }, "DELETE /api/client/account error");

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
