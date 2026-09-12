import { prisma } from "@/lib/prisma";

const VALID_ASSET_TYPES = [
  "logo",
  "logo_dark",
  "favicon",
  "social_image",
  "email_logo",
  "app_icon",
  "default_og_image",
] as const;

export type BrandAssetType = (typeof VALID_ASSET_TYPES)[number];

export async function getBrandAssets() {
  return prisma.brandAsset.findMany({
    include: {
      media: true,
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBrandAssetByType(assetType: string) {
  return prisma.brandAsset.findUnique({
    where: { assetType },
    include: { media: true },
  });
}

export async function upsertBrandAsset(params: {
  assetType: string;
  name: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  mediaId?: string;
  uploadedById: string;
}) {
  if (!VALID_ASSET_TYPES.includes(params.assetType as BrandAssetType)) {
    throw new Error(
      `Invalid asset type: ${params.assetType}. Valid types: ${VALID_ASSET_TYPES.join(", ")}`,
    );
  }

  return prisma.brandAsset.upsert({
    where: { assetType: params.assetType },
    create: {
      assetType: params.assetType,
      name: params.name,
      url: params.url,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      width: params.width,
      height: params.height,
      mediaId: params.mediaId,
      uploadedById: params.uploadedById,
    },
    update: {
      name: params.name,
      url: params.url,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      width: params.width,
      height: params.height,
      mediaId: params.mediaId,
    },
  });
}

export async function deleteBrandAsset(assetType: string) {
  return prisma.brandAsset.delete({ where: { assetType } });
}

export async function getBrandAssetsMap() {
  const assets = await prisma.brandAsset.findMany();
  const map: Record<string, string> = {};
  for (const asset of assets) {
    map[asset.assetType] = asset.url;
  }
  return map;
}

export { VALID_ASSET_TYPES };
