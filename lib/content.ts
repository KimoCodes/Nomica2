import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getPublishedPageContent = unstable_cache(
  async (pageSlug: string) => {
    return prisma.pageContent.findMany({
      where: { pageSlug, status: "PUBLISHED", isActive: true },
      include: {
        media: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            mimeType: true,
            altText: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["page-content"],
  { revalidate: 60, tags: ["content"] },
);

export const getPublishedTheme = unstable_cache(
  async () => {
    return prisma.siteTheme.findFirst({
      where: { isPublished: true },
    });
  },
  ["site-theme"],
  { revalidate: 60, tags: ["theme"] },
);

export const getBrandAssetsMap = unstable_cache(
  async () => {
    const assets = await prisma.brandAsset.findMany();
    const map: Record<string, string> = {};
    for (const asset of assets) {
      map[asset.assetType] = asset.url;
    }
    return map;
  },
  ["brand-assets"],
  { revalidate: 60, tags: ["branding"] },
);

export function getSectionContent(
  sections: Awaited<ReturnType<typeof getPublishedPageContent>>,
  sectionKey: string,
) {
  return sections.find((s) => s.sectionKey === sectionKey) || null;
}

export function getSectionText(
  sections: Awaited<ReturnType<typeof getPublishedPageContent>>,
  sectionKey: string,
  field: "title" | "subtitle" | "heading" | "description" | "ctaText" | "ctaLink" | "cta2Text" | "cta2Link" | "badge",
  fallback: string = "",
) {
  const section = getSectionContent(sections, sectionKey);
  if (!section) return fallback;
  return (section[field] as string) || fallback;
}

export function getSectionMedia(
  sections: Awaited<ReturnType<typeof getPublishedPageContent>>,
  sectionKey: string,
) {
  const section = getSectionContent(sections, sectionKey);
  return section?.media || null;
}
