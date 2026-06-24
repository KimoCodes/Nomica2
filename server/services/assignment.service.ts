import { prisma } from "@/lib/prisma";
import { ensureConversation } from "@/server/services/conversation.service";
import { requireCoachProfile } from "@/server/services/coach.service";
import { requireOwnedProgram } from "@/server/services/program.service";
import type { AssignProgramInput } from "@/server/validators/program.schema";

export async function getCoachClients(coachUserId: string) {
  await requireCoachProfile(coachUserId);

  return prisma.clientProfile.findMany({
    where: { coachId: coachUserId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      programs: {
        include: {
          program: { select: { id: true, title: true } },
          _count: { select: { completions: true } },
        },
        orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
        take: 5,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function assignProgramToClient(
  coachUserId: string,
  input: AssignProgramInput,
) {
  await requireOwnedProgram(coachUserId, input.programId);

  const client = await prisma.clientProfile.findUnique({
    where: { id: input.clientProfileId },
  });

  if (!client || client.coachId !== coachUserId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.$transaction(async (tx) => {
    await tx.clientProgram.updateMany({
      where: {
        clientProfileId: input.clientProfileId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });

    return tx.clientProgram.create({
      data: {
        clientProfileId: input.clientProfileId,
        programId: input.programId,
        isActive: true,
        startDate: new Date(),
      },
      include: {
        program: { select: { id: true, title: true } },
        clientProfile: {
          include: { user: { select: { name: true } } },
        },
      },
    });
  });
}

export async function deactivateClientProgram(
  coachUserId: string,
  clientProgramId: string,
) {
  await requireCoachProfile(coachUserId);

  const assignment = await prisma.clientProgram.findUnique({
    where: { id: clientProgramId },
    include: { clientProfile: true },
  });

  if (!assignment) {
    throw new Error("NOT_FOUND");
  }

  if (assignment.clientProfile.coachId !== coachUserId) {
    throw new Error("FORBIDDEN");
  }

  if (!assignment.isActive) {
    return assignment;
  }

  return prisma.clientProgram.update({
    where: { id: clientProgramId },
    data: {
      isActive: false,
      endDate: new Date(),
    },
  });
}

export async function linkClientToCoach(
  coachUserId: string,
  clientProfileId: string,
) {
  await requireCoachProfile(coachUserId);

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientProfileId },
    include: { user: { select: { id: true } } },
  });

  if (!client) {
    throw new Error("NOT_FOUND");
  }

  if (client.coachId && client.coachId !== coachUserId) {
    throw new Error("CLIENT_HAS_COACH");
  }

  const updated = await prisma.clientProfile.update({
    where: { id: clientProfileId },
    data: { coachId: coachUserId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await ensureConversation(updated.user.id, coachUserId);

  return updated;
}

export async function getUnassignedClients() {
  return prisma.clientProfile.findMany({
    where: { coachId: null, onboardingComplete: true },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
