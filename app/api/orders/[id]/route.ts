import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        status: true,
        currency: true,
        subtotalCents: true,
        discountCents: true,
        totalCents: true,
        paidAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            productSlug: true,
            unitAmountCents: true,
            quantity: true,
            lineTotalCents: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    logger.error({ err: error, route: "orders/[id]", userId: session.user.id }, "Failed to load order status");
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}
