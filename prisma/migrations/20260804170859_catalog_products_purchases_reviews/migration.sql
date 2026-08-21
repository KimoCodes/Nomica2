-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('PROGRAM', 'CHALLENGE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ProductFocus" AS ENUM ('SWEAT', 'SCULPT', 'CLIMB');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('WORKOUT_VIDEO', 'EXERCISE_DEMO', 'TRAINING_IMAGE', 'TRANSFORMATION', 'PROGRESS_PHOTO', 'PROGRESS_VIDEO', 'HERO_REEL', 'PRODUCT_IMAGE', 'QUIZ_MEDIA');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'COACH_ONLY', 'CLIENT_ONLY', 'TEAM_ONLY');

-- CreateEnum
CREATE TYPE "ProgressLogType" AS ENUM ('PROGRESS_PHOTO', 'FORM_CHECK', 'WEEKLY_UPDATE', 'MEASUREMENT', 'MILESTONE', 'COACH_FEEDBACK');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('ALL_ACCESS_MONTHLY', 'ALL_ACCESS_ANNUAL');
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ProgressPhoto" DROP CONSTRAINT "ProgressPhoto_clientProfileId_fkey";

-- DropIndex
DROP INDEX "ProgressPhoto_clientProfileId_idx";

-- DropIndex
DROP INDEX "ProgressPhoto_takenAt_idx";

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "difficulty" "Difficulty",
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isSellable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER;

-- AlterTable
ALTER TABLE "ProgressLog" ADD COLUMN     "coachComment" TEXT,
ADD COLUMN     "coachId" TEXT,
ADD COLUMN     "coachRating" INTEGER,
ADD COLUMN     "commentedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gluteCm" DOUBLE PRECISION,
ADD COLUMN     "hipCm" DOUBLE PRECISION,
ADD COLUMN     "mediaId" TEXT,
ADD COLUMN     "thighCm" DOUBLE PRECISION,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" "ProgressLogType" NOT NULL DEFAULT 'PROGRESS_PHOTO',
ADD COLUMN     "visibility" "MediaVisibility" NOT NULL DEFAULT 'COACH_ONLY';

-- AlterTable
ALTER TABLE "ProgressPhoto" DROP COLUMN "clientProfileId",
DROP COLUMN "cloudinaryId",
DROP COLUMN "takenAt",
DROP COLUMN "url",
ADD COLUMN     "logId" TEXT NOT NULL,
ADD COLUMN     "mediaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "ProductKind" NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "compareAtCents" INTEGER,
    "durationLabel" TEXT NOT NULL,
    "durationWeeks" INTEGER,
    "durationDays" INTEGER,
    "daysPerWeek" INTEGER,
    "focus" "ProductFocus",
    "features" TEXT[],
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "programId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "provider" TEXT NOT NULL DEFAULT 'dev',
    "providerSessionId" TEXT,
    "providerPaymentId" TEXT,
    "completedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "programId" TEXT,
    "weekId" TEXT,
    "programDayId" TEXT,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'COACH_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaTag" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "MediaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'NOMICA',
    "siteDescription" TEXT DEFAULT 'Premium Feminine Transformation Fitness',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "youtubeUrl" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "heroTagline" TEXT DEFAULT 'Stop Scrolling. Start Sculpting.',
    "heroSubtext" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingContent" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_programId_key" ON "Product"("programId");

-- CreateIndex
CREATE INDEX "Product_kind_isActive_sortOrder_idx" ON "Product"("kind", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "BundleItem_itemId_idx" ON "BundleItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleItem_bundleId_itemId_key" ON "BundleItem"("bundleId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_providerSessionId_key" ON "Purchase"("providerSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_providerPaymentId_key" ON "Purchase"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Purchase_userId_status_idx" ON "Purchase"("userId", "status");

-- CreateIndex
CREATE INDEX "Purchase_productId_status_idx" ON "Purchase"("productId", "status");

-- CreateIndex
CREATE INDEX "Review_productId_isPublished_idx" ON "Review"("productId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_uploadedById_idx" ON "Media"("uploadedById");

-- CreateIndex
CREATE INDEX "Media_programId_idx" ON "Media"("programId");

-- CreateIndex
CREATE INDEX "MediaTag_tag_idx" ON "MediaTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "MediaTag_mediaId_tag_key" ON "MediaTag"("mediaId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "LandingContent_section_key" ON "LandingContent"("section");

-- CreateIndex
CREATE INDEX "LandingContent_section_idx" ON "LandingContent"("section");

-- CreateIndex
CREATE INDEX "LandingContent_order_idx" ON "LandingContent"("order");

-- CreateIndex
CREATE INDEX "Program_isSellable_idx" ON "Program"("isSellable");

-- CreateIndex
CREATE INDEX "ProgressLog_coachId_idx" ON "ProgressLog"("coachId");

-- CreateIndex
CREATE INDEX "ProgressLog_type_idx" ON "ProgressLog"("type");

-- CreateIndex
CREATE INDEX "ProgressPhoto_logId_idx" ON "ProgressPhoto"("logId");

-- CreateIndex
CREATE INDEX "ProgressPhoto_mediaId_idx" ON "ProgressPhoto"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressPhoto_logId_mediaId_key" ON "ProgressPhoto"("logId", "mediaId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_logId_fkey" FOREIGN KEY ("logId") REFERENCES "ProgressLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ProgramWeek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaTag" ADD CONSTRAINT "MediaTag_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

