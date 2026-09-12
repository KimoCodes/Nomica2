-- CreateEnum
CREATE TYPE "WebsiteMediaStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WebsiteMediaCategory" AS ENUM ('HOMEPAGE', 'WELCOME', 'PROGRAMS', 'BUNDLES', 'SCULPT_CLUB', 'PRICING', 'ABOUT', 'PROMOTIONAL', 'BRANDING', 'GENERAL');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "WebsiteMedia" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "altText" TEXT,
    "category" "WebsiteMediaCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "WebsiteMediaStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "heading" TEXT,
    "description" TEXT,
    "body" JSONB,
    "mediaId" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "cta2Text" TEXT,
    "cta2Link" TEXT,
    "badge" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "WebsiteMediaStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAsset" (
    "id" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "mediaId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "ThemeMode" NOT NULL DEFAULT 'SYSTEM',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT,
    "primaryForeground" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "destructiveColor" TEXT,
    "successColor" TEXT,
    "warningColor" TEXT,
    "backgroundColor" TEXT,
    "foregroundColor" TEXT,
    "cardColor" TEXT,
    "mutedColor" TEXT,
    "mutedFgColor" TEXT,
    "borderColor" TEXT,
    "headingFont" TEXT,
    "bodyFont" TEXT,
    "baseFontSize" TEXT,
    "borderRadius" TEXT,
    "customTokens" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "heading" TEXT,
    "description" TEXT,
    "body" JSONB,
    "mediaUrl" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "cta2Text" TEXT,
    "cta2Link" TEXT,
    "badge" TEXT,
    "themeSnapshot" JSONB,
    "snapshot" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteMedia_category_idx" ON "WebsiteMedia"("category");

-- CreateIndex
CREATE INDEX "WebsiteMedia_status_idx" ON "WebsiteMedia"("status");

-- CreateIndex
CREATE INDEX "WebsiteMedia_uploadedById_idx" ON "WebsiteMedia"("uploadedById");

-- CreateIndex
CREATE INDEX "WebsiteMedia_createdAt_idx" ON "WebsiteMedia"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_pageSlug_sectionKey_key" ON "PageContent"("pageSlug", "sectionKey");

-- CreateIndex
CREATE INDEX "PageContent_pageSlug_idx" ON "PageContent"("pageSlug");

-- CreateIndex
CREATE INDEX "PageContent_status_idx" ON "PageContent"("status");

-- CreateIndex
CREATE INDEX "PageContent_sortOrder_idx" ON "PageContent"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BrandAsset_assetType_key" ON "BrandAsset"("assetType");

-- CreateIndex
CREATE INDEX "BrandAsset_assetType_idx" ON "BrandAsset"("assetType");

-- CreateIndex
CREATE INDEX "SiteTheme_isPublished_idx" ON "SiteTheme"("isPublished");

-- CreateIndex
CREATE INDEX "ContentVersion_entityType_entityId_idx" ON "ContentVersion"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ContentVersion_createdAt_idx" ON "ContentVersion"("createdAt");

-- AddForeignKey
ALTER TABLE "WebsiteMedia" ADD CONSTRAINT "WebsiteMedia_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "WebsiteMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAsset" ADD CONSTRAINT "BrandAsset_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "WebsiteMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandAsset" ADD CONSTRAINT "BrandAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteTheme" ADD CONSTRAINT "SiteTheme_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
