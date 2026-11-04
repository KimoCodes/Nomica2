ALTER TABLE "Order"
  ADD COLUMN "archivedAt" TIMESTAMP(3),
  ADD COLUMN "archivedById" TEXT;

CREATE INDEX "Order_status_archivedAt_createdAt_idx"
  ON "Order"("status", "archivedAt", "createdAt");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_archivedById_fkey"
  FOREIGN KEY ("archivedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
