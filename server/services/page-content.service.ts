import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { WebsiteMediaStatus, Prisma } from "@prisma/client";

export const pageContentSchema = z.object({
  pageSlug: z.string().min(1).max(100),
  sectionKey: z.string().min(1).max(100),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  heading: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  body: z.any().optional(),
  mediaId: z.string().optional().nullable(),
  ctaText: z.string().max(100).optional(),
  ctaLink: z.string().max(500).optional(),
  cta2Text: z.string().max(100).optional(),
  cta2Link: z.string().max(500).optional(),
  badge: z.string().max(100).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type PageContentInput = z.infer<typeof pageContentSchema>;

export async function getPageContentBySlug(pageSlug: string) {
  return prisma.pageContent.findMany({
    where: { pageSlug, isActive: true },
    include: {
      media: true,
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllPageContentBySlug(pageSlug: string) {
  return prisma.pageContent.findMany({
    where: { pageSlug },
    include: {
      media: true,
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublishedPageContent(pageSlug: string) {
  return prisma.pageContent.findMany({
    where: { pageSlug, status: "PUBLISHED", isActive: true },
    include: {
      media: { select: { id: true, url: true, thumbnailUrl: true, mimeType: true, altText: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPageContentById(id: string) {
  return prisma.pageContent.findUnique({
    where: { id },
    include: {
      media: true,
      createdBy: { select: { id: true, name: true } },
    },
  });
}

export async function upsertPageContent(
  data: PageContentInput & { createdById: string },
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.pageContent.findUnique({
      where: { pageSlug_sectionKey: { pageSlug: data.pageSlug, sectionKey: data.sectionKey } },
    });

    if (existing) {
      const updateData: Record<string, unknown> = {
        title: data.title,
        subtitle: data.subtitle,
        heading: data.heading,
        description: data.description,
        body: data.body as Prisma.InputJsonValue | undefined,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        cta2Text: data.cta2Text,
        cta2Link: data.cta2Link,
        badge: data.badge,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        version: existing.version + 1,
      };
      if (data.mediaId !== undefined) {
        updateData.mediaId = data.mediaId;
      }
      const updated = await tx.pageContent.update({
        where: { id: existing.id },
        data: updateData,
      });

      await createContentVersion({
        entityType: "page_content",
        entityId: updated.id,
        version: updated.version,
        data: updated,
        createdById: data.createdById,
      });

      return updated;
    }

    const created = await tx.pageContent.create({
      data: {
        pageSlug: data.pageSlug,
        sectionKey: data.sectionKey,
        title: data.title,
        subtitle: data.subtitle,
        heading: data.heading,
        description: data.description,
        body: data.body as Prisma.InputJsonValue | undefined,
        mediaId: data.mediaId,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        cta2Text: data.cta2Text,
        cta2Link: data.cta2Link,
        badge: data.badge,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        createdById: data.createdById,
      },
    });

    await createContentVersion({
      entityType: "page_content",
      entityId: created.id,
      version: 1,
      data: created,
      createdById: data.createdById,
    });

    return created;
  });
}

export async function publishPageContent(id: string) {
  return prisma.pageContent.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
}

export async function unpublishPageContent(id: string) {
  return prisma.pageContent.update({
    where: { id },
    data: { status: "DRAFT" },
  });
}

export async function deletePageContent(id: string) {
  return prisma.pageContent.delete({ where: { id } });
}

export async function getPageContentVersions(pageContentId: string) {
  return prisma.contentVersion.findMany({
    where: { entityType: "page_content", entityId: pageContentId },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { version: "desc" },
  });
}

async function createContentVersion(params: {
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  createdById: string;
}) {
  return prisma.contentVersion.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      version: params.version,
      title: params.data.title as string | null,
      subtitle: params.data.subtitle as string | null,
      heading: params.data.heading as string | null,
      description: params.data.description as string | null,
      body: params.data.body as Prisma.InputJsonValue | undefined,
      mediaUrl: (params.data.media as { url?: string } | null)?.url ?? null,
      ctaText: params.data.ctaText as string | null,
      ctaLink: params.data.ctaLink as string | null,
      cta2Text: params.data.cta2Text as string | null,
      cta2Link: params.data.cta2Link as string | null,
      badge: params.data.badge as string | null,
      snapshot: params.data as Prisma.InputJsonValue,
      createdById: params.createdById,
    },
  });
}

export async function rollbackPageContent(
  id: string,
  versionId: string,
  performedById: string,
) {
  const version = await prisma.contentVersion.findUnique({
    where: { id: versionId },
  });
  if (!version || version.entityType !== "page_content" || version.entityId !== id) {
    throw new Error("Version not found or does not belong to this content");
  }

  const snapshot = version.snapshot as Record<string, unknown> | null;
  if (!snapshot) throw new Error("Version snapshot is empty");

  const current = await prisma.pageContent.findUnique({ where: { id } });
  if (!current) throw new Error("Page content not found");

  const updated = await prisma.pageContent.update({
    where: { id },
    data: {
      title: (snapshot.title as string) ?? current.title,
      subtitle: (snapshot.subtitle as string) ?? current.subtitle,
      heading: (snapshot.heading as string) ?? current.heading,
      description: (snapshot.description as string) ?? current.description,
      body: (snapshot.body as Prisma.InputJsonValue) ?? undefined,
      mediaId: (snapshot.mediaId as string) ?? current.mediaId,
      ctaText: (snapshot.ctaText as string) ?? current.ctaText,
      ctaLink: (snapshot.ctaLink as string) ?? current.ctaLink,
      cta2Text: (snapshot.cta2Text as string) ?? current.cta2Text,
      cta2Link: (snapshot.cta2Link as string) ?? current.cta2Link,
      badge: (snapshot.badge as string) ?? current.badge,
      sortOrder: (snapshot.sortOrder as number) ?? current.sortOrder,
      version: current.version + 1,
    },
  });

  await createContentVersion({
    entityType: "page_content",
    entityId: id,
    version: updated.version,
    data: updated as unknown as Record<string, unknown>,
    createdById: performedById,
  });

  return updated;
}

export async function getAllPageSlugs() {
  const slugs = await prisma.pageContent.findMany({
    select: { pageSlug: true },
    distinct: ["pageSlug"],
    orderBy: { pageSlug: "asc" },
  });
  return slugs.map((s) => s.pageSlug);
}
