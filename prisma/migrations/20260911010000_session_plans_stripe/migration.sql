-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULE_REQUESTED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('CONSULTATION', 'TRAINING', 'ASSESSMENT', 'FOLLOW_UP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SESSION_BOOKED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_RESCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'SESSION_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'EXERCISE_PLAN_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'NUTRITION_PLAN_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'PLAN_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'PLAN_PROGRESS_UPDATE';

-- AlterTable
ALTER TABLE "CoachBooking" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "clientConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "coachNotes" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "meetingUrl" TEXT,
ADD COLUMN     "rescheduleOfId" TEXT,
ADD COLUMN     "rescheduleReason" TEXT,
ADD COLUMN     "sessionType" "SessionType" NOT NULL DEFAULT 'CONSULTATION',
DROP COLUMN "status",
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "BillingEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedExercisePlan" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "bookingId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "weeklySchedule" JSONB,
    "coachNotes" TEXT,
    "clientNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizedExercisePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedExerciseItem" (
    "id" TEXT NOT NULL,
    "personalizedPlanId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "name" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup",
    "dayOfWeek" INTEGER,
    "order" INTEGER NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "durationMinutes" INTEGER,
    "restSeconds" INTEGER,
    "intensity" TEXT,
    "instructions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizedExerciseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedNutritionPlan" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "coachProfileId" TEXT NOT NULL,
    "bookingId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dailyCalories" INTEGER,
    "dailyProtein" DOUBLE PRECISION,
    "dailyCarbs" DOUBLE PRECISION,
    "dailyFat" DOUBLE PRECISION,
    "dailyWaterMl" INTEGER,
    "coachNotes" TEXT,
    "clientNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizedNutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedMeal" (
    "id" TEXT NOT NULL,
    "personalizedPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "timeOfDay" TEXT,
    "order" INTEGER NOT NULL,
    "foods" JSONB,
    "instructions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalizedMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanProgress" (
    "id" TEXT NOT NULL,
    "exercisePlanId" TEXT,
    "nutritionPlanId" TEXT,
    "clientProfileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completionPercentage" DOUBLE PRECISION,
    "setsCompleted" INTEGER,
    "repsCompleted" INTEGER,
    "durationMinutes" INTEGER,
    "adherenceScore" DOUBLE PRECISION,
    "notes" TEXT,
    "coachFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingEvent_stripeEventId_key" ON "BillingEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "BillingEvent_stripeEventId_idx" ON "BillingEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "BillingEvent_type_idx" ON "BillingEvent"("type");

-- CreateIndex
CREATE INDEX "BillingEvent_createdAt_idx" ON "BillingEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PersonalizedExercisePlan_clientProfileId_idx" ON "PersonalizedExercisePlan"("clientProfileId");

-- CreateIndex
CREATE INDEX "PersonalizedExercisePlan_coachProfileId_idx" ON "PersonalizedExercisePlan"("coachProfileId");

-- CreateIndex
CREATE INDEX "PersonalizedExercisePlan_status_idx" ON "PersonalizedExercisePlan"("status");

-- CreateIndex
CREATE INDEX "PersonalizedExercisePlan_clientProfileId_status_idx" ON "PersonalizedExercisePlan"("clientProfileId", "status");

-- CreateIndex
CREATE INDEX "PersonalizedExerciseItem_personalizedPlanId_idx" ON "PersonalizedExerciseItem"("personalizedPlanId");

-- CreateIndex
CREATE INDEX "PersonalizedExerciseItem_exerciseId_idx" ON "PersonalizedExerciseItem"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalizedExerciseItem_personalizedPlanId_dayOfWeek_order_key" ON "PersonalizedExerciseItem"("personalizedPlanId", "dayOfWeek", "order");

-- CreateIndex
CREATE INDEX "PersonalizedNutritionPlan_clientProfileId_idx" ON "PersonalizedNutritionPlan"("clientProfileId");

-- CreateIndex
CREATE INDEX "PersonalizedNutritionPlan_coachProfileId_idx" ON "PersonalizedNutritionPlan"("coachProfileId");

-- CreateIndex
CREATE INDEX "PersonalizedNutritionPlan_status_idx" ON "PersonalizedNutritionPlan"("status");

-- CreateIndex
CREATE INDEX "PersonalizedNutritionPlan_clientProfileId_status_idx" ON "PersonalizedNutritionPlan"("clientProfileId", "status");

-- CreateIndex
CREATE INDEX "PersonalizedMeal_personalizedPlanId_idx" ON "PersonalizedMeal"("personalizedPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalizedMeal_personalizedPlanId_mealType_order_key" ON "PersonalizedMeal"("personalizedPlanId", "mealType", "order");

-- CreateIndex
CREATE INDEX "PlanProgress_exercisePlanId_idx" ON "PlanProgress"("exercisePlanId");

-- CreateIndex
CREATE INDEX "PlanProgress_nutritionPlanId_idx" ON "PlanProgress"("nutritionPlanId");

-- CreateIndex
CREATE INDEX "PlanProgress_clientProfileId_idx" ON "PlanProgress"("clientProfileId");

-- CreateIndex
CREATE INDEX "PlanProgress_date_idx" ON "PlanProgress"("date");

-- CreateIndex
CREATE INDEX "CoachBooking_status_idx" ON "CoachBooking"("status");

-- CreateIndex
CREATE INDEX "CoachBooking_clientProfileId_status_idx" ON "CoachBooking"("clientProfileId", "status");

-- CreateIndex
CREATE INDEX "CoachBooking_coachProfileId_status_idx" ON "CoachBooking"("coachProfileId", "status");

-- AddForeignKey
ALTER TABLE "CoachBooking" ADD CONSTRAINT "CoachBooking_rescheduleOfId_fkey" FOREIGN KEY ("rescheduleOfId") REFERENCES "CoachBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedExercisePlan" ADD CONSTRAINT "PersonalizedExercisePlan_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedExercisePlan" ADD CONSTRAINT "PersonalizedExercisePlan_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedExercisePlan" ADD CONSTRAINT "PersonalizedExercisePlan_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "CoachBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedExerciseItem" ADD CONSTRAINT "PersonalizedExerciseItem_personalizedPlanId_fkey" FOREIGN KEY ("personalizedPlanId") REFERENCES "PersonalizedExercisePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedExerciseItem" ADD CONSTRAINT "PersonalizedExerciseItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedNutritionPlan" ADD CONSTRAINT "PersonalizedNutritionPlan_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedNutritionPlan" ADD CONSTRAINT "PersonalizedNutritionPlan_coachProfileId_fkey" FOREIGN KEY ("coachProfileId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedNutritionPlan" ADD CONSTRAINT "PersonalizedNutritionPlan_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "CoachBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedMeal" ADD CONSTRAINT "PersonalizedMeal_personalizedPlanId_fkey" FOREIGN KEY ("personalizedPlanId") REFERENCES "PersonalizedNutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanProgress" ADD CONSTRAINT "PlanProgress_exercisePlanId_fkey" FOREIGN KEY ("exercisePlanId") REFERENCES "PersonalizedExercisePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanProgress" ADD CONSTRAINT "PlanProgress_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES "PersonalizedNutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanProgress" ADD CONSTRAINT "PlanProgress_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

