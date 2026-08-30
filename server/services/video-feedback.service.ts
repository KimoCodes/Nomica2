import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export type VideoFeedback = {
  id: string;
  videoUrl: string;
  exerciseName: string;
  status: "pending" | "reviewed" | "approved";
  coachNotes: string | null;
  formScore: number | null;
  createdAt: string;
};

export async function submitVideoForFeedback(
  userId: string,
  videoUrl: string,
  exerciseName: string,
  notes?: string,
): Promise<{ id: string }> {
  const client = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!client) {
    throw new Error("Client profile not found");
  }

  const video = await prisma.videoFeedback.create({
    data: {
      clientProfileId: client.id,
      videoUrl,
      exerciseName,
      notes: notes || null,
    },
  });

  return { id: video.id };
}

export async function getVideoFeedback(
  userId: string,
): Promise<VideoFeedback[]> {
  const client = await prisma.clientProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!client) return [];

  const videos = await prisma.videoFeedback.findMany({
    where: { clientProfileId: client.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return videos.map((v) => ({
    id: v.id,
    videoUrl: v.videoUrl,
    exerciseName: v.exerciseName,
    status: v.status as "pending" | "reviewed" | "approved",
    coachNotes: v.coachNotes,
    formScore: v.formScore,
    createdAt: v.createdAt.toISOString(),
  }));
}

export async function addCoachFeedback(
  videoId: string,
  coachId: string,
  notes: string,
  formScore: number,
): Promise<void> {
  await prisma.videoFeedback.update({
    where: { id: videoId },
    data: {
      coachNotes: notes,
      formScore,
      status: "reviewed",
      reviewedBy: coachId,
      reviewedAt: new Date(),
    },
  });
}

export async function getPendingVideos(): Promise<VideoFeedback[]> {
  const videos = await prisma.videoFeedback.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: {
      clientProfile: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return videos.map((v) => ({
    id: v.id,
    videoUrl: v.videoUrl,
    exerciseName: v.exerciseName,
    status: v.status as "pending",
    coachNotes: null,
    formScore: null,
    createdAt: v.createdAt.toISOString(),
  }));
}
