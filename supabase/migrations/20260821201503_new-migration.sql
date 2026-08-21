-- CreateEnum
CREATE TYPE "FreeTrialStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- AlterEnum: Add free trial notification types
ALTER TYPE "NotificationType" ADD VALUE 'FREE_TRIAL_GRANTED';
ALTER TYPE "NotificationType" ADD VALUE 'FREE_TRIAL_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'FREE_TRIAL_EXPIRED';
ALTER TYPE "NotificationType" ADD VALUE 'FREE_TRIAL_CANCELLED';

-- CreateTable
CREATE TABLE "FreeTrial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "FreeTrialStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreeTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FreeTrial_userId_idx" ON "FreeTrial"("userId");
CREATE INDEX "FreeTrial_grantedById_idx" ON "FreeTrial"("grantedById");
CREATE INDEX "FreeTrial_status_idx" ON "FreeTrial"("status");
CREATE INDEX "FreeTrial_endDate_idx" ON "FreeTrial"("endDate");

-- AddForeignKey
ALTER TABLE "FreeTrial" ADD CONSTRAINT "FreeTrial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreeTrial" ADD CONSTRAINT "FreeTrial_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
