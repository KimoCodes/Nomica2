import { MediaType, MediaVisibility, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type MediaWhereInput = Prisma.MediaWhereInput;

export async function getCoachMedia(
  coachId: string,
  options?: {
    type?: MediaType;
    tag?: string;
    search?: string;
    programId?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: MediaWhereInput = {
    uploadedById: coachId,
  };

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.tag) {
    where.tags = { some: { tag: options.tag } };
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
    ];
  }

  if (options?.programId) {
    where.programId = options.programId;
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: {
        tags: true,
        _count: { select: { progressLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return {
    media,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMediaById(mediaId: string) {
  return prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      tags: true,
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
      program: {
        select: { id: true, title: true },
      },
      progressLogs: {
        select: { id: true, type: true, title: true, createdAt: true },
        take: 10,
      },
    },
  });
}

export async function updateMedia(
  mediaId: string,
  data: {
    title?: string;
    description?: string;
    visibility?: MediaVisibility;
    tags?: string[];
    programId?: string | null;
    weekId?: string | null;
    programDayId?: string | null;
  },
) {
  return prisma.media.update({
    where: { id: mediaId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.visibility !== undefined && { visibility: data.visibility }),
      ...(data.programId !== undefined && { programId: data.programId }),
      ...(data.weekId !== undefined && { weekId: data.weekId }),
      ...(data.programDayId !== undefined && { programDayId: data.programDayId }),
      ...(data.tags !== undefined && {
        tags: {
          deleteMany: {},
          create: data.tags.map((tag) => ({ tag })),
        },
      }),
    },
    include: {
      tags: true,
    },
  });
}

export async function deleteMediaById(mediaId: string) {
  return prisma.media.delete({ where: { id: mediaId } });
}

export async function getMediaTags(search?: string) {
  const where: Record<string, unknown> = {};
  if (search) {
    where.tag = { contains: search, mode: "insensitive" };
  }

  const tags = await prisma.mediaTag.groupBy({
    by: ["tag"],
    where,
    _count: { tag: true },
    orderBy: { _count: { tag: "desc" } },
    take: 50,
  });

  return tags.map((t) => ({
    tag: t.tag,
    count: t._count.tag,
  }));
}

export async function getClientProgress(
  clientProfileId: string,
  options?: {
    page?: number;
    limit?: number;
  },
) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.progressLog.findMany({
      where: { clientProfileId },
      include: {
        media: true,
        photos: {
          include: { media: true },
        },
        coach: {
          select: { id: true, name: true },
        },
      },
      orderBy: { loggedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.progressLog.count({
      where: { clientProfileId },
    }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function addCoachComment(
  logId: string,
  coachId: string,
  comment: string,
  rating?: number,
) {
  return prisma.progressLog.update({
    where: { id: logId },
    data: {
      coachId,
      coachComment: comment,
      coachRating: rating ?? null,
      commentedAt: new Date(),
      type: "COACH_FEEDBACK",
    },
  });
}

export async function getMediaByProgram(programId: string) {
  return prisma.media.findMany({
    where: { programId },
    include: {
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientMedia(
  clientUserId: string,
  options?: {
    type?: MediaType;
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: MediaWhereInput = {
    OR: [
      { uploadedById: clientUserId },
      { visibility: "PUBLIC" },
      { visibility: "CLIENT_ONLY" },
    ],
  };

  if (options?.type) {
    where.type = options.type;
  }

  if (options?.search) {
    where.AND = [
      {
        OR: [
          { title: { contains: options.search, mode: "insensitive" } },
          { description: { contains: options.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      include: {
        tags: true,
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return {
    media,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMediaStats(coachId: string) {
  const [totalMedia, videos, images, byType] = await Promise.all([
    prisma.media.count({ where: { uploadedById: coachId } }),
    prisma.media.count({
      where: {
        uploadedById: coachId,
        type: { in: ["WORKOUT_VIDEO", "EXERCISE_DEMO", "PROGRESS_VIDEO"] },
      },
    }),
    prisma.media.count({
      where: {
        uploadedById: coachId,
        type: { in: ["TRAINING_IMAGE", "TRANSFORMATION", "PROGRESS_PHOTO"] },
      },
    }),
    prisma.media.groupBy({
      by: ["type"],
      where: { uploadedById: coachId },
      _count: { type: true },
    }),
  ]);

  return {
    total: totalMedia,
    videos,
    images,
    byType: byType.map((item) => ({
      type: item.type,
      count: item._count.type,
    })),
  };
}
