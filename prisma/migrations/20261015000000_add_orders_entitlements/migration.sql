-- Add one-time order snapshots and durable product entitlements. Keep the
-- legacy Purchase, Subscription, Payment, and PaymentRequest records intact.

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'PAID',
  'PAYMENT_FAILED',
  'CANCELED',
  'PARTIALLY_REFUNDED',
  'REFUNDED'
);

CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'REVOKED');

CREATE TYPE "EntitlementGrantType" AS ENUM (
  'PURCHASE',
  'BUNDLE',
  'MIGRATION',
  'MANUAL'
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "subtotalCents" INTEGER NOT NULL,
  "discountCents" INTEGER NOT NULL DEFAULT 0,
  "totalCents" INTEGER NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "stripeCheckoutSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_subtotalCents_nonnegative_check" CHECK ("subtotalCents" >= 0),
  CONSTRAINT "Order_discountCents_nonnegative_check" CHECK ("discountCents" >= 0),
  CONSTRAINT "Order_totalCents_nonnegative_check" CHECK ("totalCents" >= 0)
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "productSlug" TEXT NOT NULL,
  "productKind" "ProductKind" NOT NULL,
  "unitAmountCents" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "lineTotalCents" INTEGER NOT NULL,
  "bundleProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_unitAmountCents_nonnegative_check" CHECK ("unitAmountCents" >= 0),
  CONSTRAINT "OrderItem_quantity_positive_check" CHECK ("quantity" > 0),
  CONSTRAINT "OrderItem_lineTotalCents_nonnegative_check" CHECK ("lineTotalCents" >= 0)
);

CREATE TABLE "OrderPayment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'stripe',
  "providerPaymentId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" TEXT NOT NULL,
  "providerEventId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderPayment_amountCents_nonnegative_check" CHECK ("amountCents" >= 0)
);

CREATE TABLE "Entitlement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderItemId" TEXT,
  "grantType" "EntitlementGrantType" NOT NULL,
  "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
  "idempotencyKey" TEXT NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

CREATE UNIQUE INDEX "OrderItem_orderId_productId_key" ON "OrderItem"("orderId", "productId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

CREATE UNIQUE INDEX "OrderPayment_providerPaymentId_key" ON "OrderPayment"("providerPaymentId");
CREATE UNIQUE INDEX "OrderPayment_providerEventId_key" ON "OrderPayment"("providerEventId");
CREATE INDEX "OrderPayment_orderId_status_idx" ON "OrderPayment"("orderId", "status");

CREATE UNIQUE INDEX "Entitlement_idempotencyKey_key" ON "Entitlement"("idempotencyKey");
CREATE INDEX "Entitlement_userId_status_idx" ON "Entitlement"("userId", "status");
CREATE INDEX "Entitlement_productId_status_idx" ON "Entitlement"("productId", "status");
CREATE INDEX "Entitlement_orderItemId_idx" ON "Entitlement"("orderItemId");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderPayment"
  ADD CONSTRAINT "OrderPayment_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Entitlement"
  ADD CONSTRAINT "Entitlement_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Entitlement_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Entitlement_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClientProgram" ADD COLUMN "entitlementId" TEXT;
CREATE UNIQUE INDEX "ClientProgram_entitlementId_key" ON "ClientProgram"("entitlementId");
ALTER TABLE "ClientProgram"
  ADD CONSTRAINT "ClientProgram_entitlementId_fkey"
  FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
