import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  WebsiteMediaStatus,
  WebsiteMediaCategory,
  Prisma,
} from "@prisma/client";

export const uploadWebsiteMediaSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  altText: z.string().max(300).optional(),
  category: z.nativeEnum(WebsiteMediaCategory).default("GENERAL"),
});

export type UploadWebsiteMediaInput = z.infer<typeof uploadWebsiteMediaSchema>;

export async function getWebsiteMedia(params?: {
  category?: WebsiteMediaCategory;
  status?: WebsiteMediaStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const {
    category,
    status,
    search,
    page = 1,
    limit = 20,
  } = params || {};

  const where: Prisma.WebsiteMediaWhereInput = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { altText: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.websiteMedia.findMany({
      where,
      include: { uploadedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.websiteMedia.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getWebsiteMediaById(id: string) {
  return prisma.websiteMedia.findUnique({
    where: { id },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });
}

export async function createWebsiteMedia(
  data: UploadWebsiteMediaInput & {
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
    duration?: number;
    uploadedById: string;
  },
) {
  return prisma.websiteMedia.create({ data });
}

export async function updateWebsiteMedia(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    altText: string;
    category: WebsiteMediaCategory;
    status: WebsiteMediaStatus;
  }>,
) {
  return prisma.websiteMedia.update({ where: { id }, data });
}

export async function publishWebsiteMedia(id: string) {
  return prisma.websiteMedia.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
}

export async function archiveWebsiteMedia(id: string) {
  return prisma.websiteMedia.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
}

export async function deleteWebsiteMedia(id: string) {
  const media = await prisma.websiteMedia.findUnique({ where: { id } });
  if (!media) throw new Error("Media not found");

  const isInUse = await prisma.pageContent.findFirst({
    where: { mediaId: id },
  });
  if (isInUse) {
    throw new Error(
      "Cannot delete media that is currently assigned to page content. Unassign it first.",
    );
  }

  const isBrandAsset = await prisma.brandAsset.findFirst({
    where: { mediaId: id },
  });
  if (isBrandAsset) {
    throw new Error(
      "Cannot delete media that is used as a brand asset. Remove the brand asset first.",
    );
  }

  return prisma.websiteMedia.delete({ where: { id } });
}

export async function getPublishedMediaByCategory(
  category: WebsiteMediaCategory,
) {
  return prisma.websiteMedia.findMany({
    where: { category, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMediaStats() {
  const [total, published, draft, archived, byCategory] = await Promise.all([
    prisma.websiteMedia.count(),
    prisma.websiteMedia.count({ where: { status: "PUBLISHED" } }),
    prisma.websiteMedia.count({ where: { status: "DRAFT" } }),
    prisma.websiteMedia.count({ where: { status: "ARCHIVED" } }),
    prisma.websiteMedia.groupBy({
      by: ["category"],
      _count: true,
    }),
  ]);

  return { total, published, draft, archived, byCategory };
}
