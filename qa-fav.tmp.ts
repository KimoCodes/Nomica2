import { prisma } from "@/lib/prisma";
async function main() {
  const user = await prisma.user.findUnique({ where: { email: "qa-phase1-client@nomitips.test" }, select: { id: true } });
  const product = await prisma.product.findUnique({ where: { slug: "6-week-dumbbell-glute-growth" }, select: { id: true } });
  if (!user || !product) throw new Error("missing");
  await prisma.favorite.upsert({
    where: { userId_type_targetId: { userId: user.id, type: "PROGRAM", targetId: product.id } },
    create: { userId: user.id, type: "PROGRAM", targetId: product.id },
    update: {},
  });
  console.log("favorite added");
}
main().then(() => process.exit(0));
