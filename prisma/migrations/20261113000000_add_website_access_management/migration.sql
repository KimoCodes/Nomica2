-- CreateEnum
CREATE TYPE "WebsiteAccessMode" AS ENUM ('NORMAL', 'COMING_SOON', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "SiteSettings"
  ADD COLUMN "websiteAccessMode" "WebsiteAccessMode" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "publicAccessRestrictionEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "comingSoonHeadline" TEXT DEFAULT 'NomiTips is launching soon',
  ADD COLUMN "comingSoonMessage" TEXT DEFAULT 'We’re building a premium experience to help you transform with confidence.',
  ADD COLUMN "comingSoonLaunchAt" TIMESTAMP(3),
  ADD COLUMN "comingSoonTimezone" TEXT DEFAULT 'UTC',
  ADD COLUMN "comingSoonAutoSwitch" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "maintenanceHeadline" TEXT DEFAULT 'We’re making updates',
  ADD COLUMN "maintenanceMessage" TEXT DEFAULT 'NomiTips is temporarily unavailable while we improve the experience.',
  ADD COLUMN "maintenanceReturnAt" TIMESTAMP(3),
  ADD COLUMN "maintenanceTimezone" TEXT DEFAULT 'UTC',
  ADD COLUMN "lastAccessConfigUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "lastAccessConfigUpdatedById" TEXT;

-- CreateTable
CREATE TABLE "ApprovedIpAddress" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ApprovedIpAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteAccessAuditLog" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteAccessAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApprovedIpAddress_siteSettingsId_value_key"
    ON "ApprovedIpAddress"("siteSettingsId", "value");

CREATE INDEX "ApprovedIpAddress_siteSettingsId_idx"
    ON "ApprovedIpAddress"("siteSettingsId");

CREATE INDEX "ApprovedIpAddress_value_idx"
    ON "ApprovedIpAddress"("value");

CREATE INDEX "SiteAccessAuditLog_siteSettingsId_idx"
    ON "SiteAccessAuditLog"("siteSettingsId");

CREATE INDEX "SiteAccessAuditLog_action_idx"
    ON "SiteAccessAuditLog"("action");

-- AddForeignKey
ALTER TABLE "SiteSettings"
  ADD CONSTRAINT "SiteSettings_lastAccessConfigUpdatedById_fkey"
  FOREIGN KEY ("lastAccessConfigUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ApprovedIpAddress"
  ADD CONSTRAINT "ApprovedIpAddress_siteSettingsId_fkey"
  FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ApprovedIpAddress_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SiteAccessAuditLog"
  ADD CONSTRAINT "SiteAccessAuditLog_siteSettingsId_fkey"
  FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "SiteAccessAuditLog_performedById_fkey"
  FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
