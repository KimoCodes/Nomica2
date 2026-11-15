import { hashSync } from "bcrypt";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = "qa-phase1-client@nomitips.test";
  await prisma.entitlement.deleteMany({ where: { user: { email } } });
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      name: "QA Phase1 Client",
      email,
      password: hashSync("QaPhase1Test!2026", 10),
      role: "CLIENT",
      emailVerified: new Date(),
    },
    select: { id: true },
  });

  const product = await prisma.product.findUnique({
    where: { slug: "6-week-dumbbell-glute-growth" },
    select: { id: true },
  });
  if (!product) throw new Error("product not found");

  const ent = await prisma.entitlement.create({
    data: {
      userId: user.id,
      productId: product.id,
      grantType: "MANUAL",
      status: "ACTIVE",
      idempotencyKey: `qa-phase1-${user.id}`,
      reason: "Phase 1 QA verification - temporary",
    },
    select: { id: true },
  });

  console.log(JSON.stringify({ userId: user.id, entitlementId: ent.id }));
}
main().then(() => process.exit(0));
