import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ subscription: null });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        status: true,
        plan: true,
        currentPeriodEnd: true,
      },
    });

    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ subscription: null });
  }
}
