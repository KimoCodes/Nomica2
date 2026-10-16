-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable: publication state, equipment, preview media
ALTER TABLE "Product"
  ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "equipment" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "previewVideoUrl" TEXT;

-- Backfill: previously active products are already live on the storefront
UPDATE "Product" SET "status" = 'PUBLISHED' WHERE "isActive" = true;

-- DropIndex
DROP INDEX "Product_kind_isActive_sortOrder_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isActive";

-- CreateIndex
CREATE INDEX "Product_kind_status_sortOrder_idx" ON "Product"("kind", "status", "sortOrder");
