import { prisma } from "@/lib/prisma";
async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "qa-phase1-client@nomitips.test" },
    select: { id: true, clientProfile: { select: { id: true } } },
  });
  if (!user) throw new Error("no user");
  if (!user.clientProfile) {
    await prisma.clientProfile.create({
      data: { userId: user.id, onboardingComplete: true },
    });
    console.log("client profile created");
  } else {
    await prisma.clientProfile.update({
      where: { id: user.clientProfile.id },
      data: { onboardingComplete: true },
    });
    console.log("client profile updated");
  }
}
main().then(() => process.exit(0));
