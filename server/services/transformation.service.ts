import { prisma } from "@/lib/prisma";
import { CreateTransformationInput } from "@/server/validators/transformation.schema";

export async function createTransformationSubmission(
  clientUserId: string,
  input: CreateTransformationInput,
  beforePhotoId?: string,
  afterPhotoId?: string,
) {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: clientUserId },
  });

  if (!profile) {
    throw new Error("Client profile not found");
  }

  return prisma.transformationSubmission.create({
    data: {
      clientProfileId: profile.id,
      name: input.name,
      quote: input.quote,
      story: input.story,
      beforeWeight: input.beforeWeight ?? null,
      afterWeight: input.afterWeight ?? null,
      duration: input.duration ?? null,
      programName: input.programName ?? null,
      beforePhotoId: beforePhotoId ?? null,
      afterPhotoId: afterPhotoId ?? null,
      status: "SUBMITTED",
    },
  });
}

export async function getClientTransformations(clientUserId: string) {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: clientUserId },
  });

  if (!profile) {
    return [];
  }

  return prisma.transformationSubmission.findMany({
    where: { clientProfileId: profile.id },
    include: {
      beforePhoto: true,
      afterPhoto: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApprovedTransformations(limit = 4) {
  return prisma.transformationSubmission.findMany({
    where: { status: "APPROVED" },
    include: {
      beforePhoto: true,
      afterPhoto: true,
      clientProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { reviewedAt: "desc" },
    take: limit,
  });
}

export async function getPendingTransformations() {
  return prisma.transformationSubmission.findMany({
    where: { status: "SUBMITTED" },
    include: {
      beforePhoto: true,
      afterPhoto: true,
      clientProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveTransformation(
  submissionId: string,
  coachNote?: string,
) {
  return prisma.transformationSubmission.update({
    where: { id: submissionId },
    data: {
      status: "APPROVED",
      coachNote: coachNote ?? null,
      reviewedAt: new Date(),
    },
  });
}

export async function rejectTransformation(
  submissionId: string,
  coachNote?: string,
) {
  return prisma.transformationSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      coachNote: coachNote ?? null,
      reviewedAt: new Date(),
    },
  });
}
