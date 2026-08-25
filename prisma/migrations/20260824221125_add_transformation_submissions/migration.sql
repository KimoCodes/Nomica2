-- CreateEnum
CREATE TYPE "TransformationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "TransformationSubmission" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "beforePhotoId" TEXT,
    "afterPhotoId" TEXT,
    "beforeWeight" DOUBLE PRECISION,
    "afterWeight" DOUBLE PRECISION,
    "duration" TEXT,
    "programName" TEXT,
    "status" "TransformationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coachNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransformationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransformationSubmission_clientProfileId_idx" ON "TransformationSubmission"("clientProfileId");

-- CreateIndex
CREATE INDEX "TransformationSubmission_status_idx" ON "TransformationSubmission"("status");

-- AddForeignKey
ALTER TABLE "TransformationSubmission" ADD CONSTRAINT "TransformationSubmission_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransformationSubmission" ADD CONSTRAINT "TransformationSubmission_beforePhotoId_fkey" FOREIGN KEY ("beforePhotoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransformationSubmission" ADD CONSTRAINT "TransformationSubmission_afterPhotoId_fkey" FOREIGN KEY ("afterPhotoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
