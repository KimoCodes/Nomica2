import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  approveTransformation,
  rejectTransformation,
} from "@/server/services/transformation.service";
import { createNotification } from "@/server/services/notification.service";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: submissionId } = await params;

    if (session.user.role !== Role.COACH && session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, coachNote } = body as {
      action: string;
      coachNote?: string;
    };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const submission = await prisma.transformationSubmission.findUnique({
      where: { id: submissionId },
      include: {
        clientProfile: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    if (submission.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "This submission has already been reviewed" },
        { status: 400 },
      );
    }

    const updated =
      action === "approve"
        ? await approveTransformation(submissionId, coachNote)
        : await rejectTransformation(submissionId, coachNote);

    try {
      const clientUserId = submission.clientProfile.userId;
      await createNotification({
        userId: clientUserId,
        type: "CHECK_IN_DUE",
        title: `Transformation ${action === "approve" ? "approved" : "rejected"}`,
        body:
          action === "approve"
            ? "Your transformation story has been approved and will appear on the site!"
            : `Your transformation story was not approved.${coachNote ? ` Note: ${coachNote}` : ""}`,
        link: "/client/progress",
      });
    } catch {
      // Notification failure should not block the action
    }

    return NextResponse.json({ submission: updated });
  } catch (error) {
    console.error("Transformation review error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to review transformation" },
      { status: 500 },
    );
  }
}
