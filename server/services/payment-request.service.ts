import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/services/notification.service";
import { approveSubscription } from "@/server/services/subscription.service";

type SubmitPaymentInput = {
  plan: SubscriptionPlan;
  amount: number;
  currency?: string;
  paymentMethod: string;
  transactionRef?: string;
  proofUrl: string;
  proofFileName?: string;
  notes?: string;
};

export async function submitPaymentRequest(
  clientUserId: string,
  input: SubmitPaymentInput,
) {
  const client = await prisma.clientProfile.findFirst({
    where: { userId: clientUserId },
    select: { id: true, coachId: true },
  });

  if (!client) {
    throw new Error("CLIENT_PROFILE_NOT_FOUND");
  }

  if (input.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  // Check for existing pending request
  const existingPending = await prisma.paymentRequest.findFirst({
    where: {
      clientUserId,
      status: { in: ["PENDING", "PROOF_REQUESTED"] },
    },
  });

  if (existingPending) {
    throw new Error("You already have a pending payment request. Please wait for it to be reviewed.");
  }

  const paymentRequest = await prisma.paymentRequest.create({
    data: {
      clientUserId,
      coachUserId: client.coachId,
      plan: input.plan,
      amount: input.amount,
      currency: input.currency ?? "USD",
      paymentMethod: input.paymentMethod,
      transactionRef: input.transactionRef ?? null,
      proofUrl: input.proofUrl,
      proofFileName: input.proofFileName ?? null,
      notes: input.notes ?? null,
      status: "PENDING",
    },
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
      coachUser: { select: { id: true, name: true } },
    },
  });

  // Create audit log
  await prisma.paymentRequestAuditLog.create({
    data: {
      paymentRequestId: paymentRequest.id,
      action: "SUBMITTED",
      performedById: clientUserId,
      note: `Payment request submitted for ${input.plan.replace(/_/g, " ")}`,
    },
  });

  // Notify coach if assigned
  if (client.coachId) {
    try {
      await createNotification({
        userId: client.coachId,
        type: "PAYMENT_SUBMITTED",
        title: "New payment request",
        body: `${paymentRequest.clientUser.name ?? "A client"} submitted a payment request for ${input.plan.replace(/_/g, " ")}.`,
        link: "/coach/payments",
      });
    } catch {
      // Notification failure should not block submission
    }
  }

  // Notify all admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  for (const admin of admins) {
    try {
      await createNotification({
        userId: admin.id,
        type: "PAYMENT_SUBMITTED",
        title: "New payment request",
        body: `${paymentRequest.clientUser.name ?? "A client"} submitted a payment request for ${input.plan.replace(/_/g, " ")}.`,
        link: "/admin/payments",
      });
    } catch {
      // Notification failure should not block submission
    }
  }

  return paymentRequest;
}

export async function getPaymentRequestsForAdmin() {
  return prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
      coachUser: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      auditLogs: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          note: true,
          performedBy: { select: { name: true } },
          createdAt: true,
        },
      },
    },
  });
}

export async function getPaymentRequestsForCoach(coachUserId: string) {
  // Verify the user is a coach
  const coach = await prisma.coachProfile.findFirst({
    where: { userId: coachUserId },
    select: { id: true },
  });

  if (!coach) {
    throw new Error("COACH_PROFILE_NOT_FOUND");
  }

  return prisma.paymentRequest.findMany({
    where: { coachUserId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } },
      auditLogs: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          note: true,
          performedBy: { select: { name: true } },
          createdAt: true,
        },
      },
    },
  });
}

export async function getPaymentRequestById(paymentRequestId: string) {
  return prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
      coachUser: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      auditLogs: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          note: true,
          performedBy: { select: { name: true } },
          createdAt: true,
        },
      },
    },
  });
}

export async function approvePaymentRequest(
  paymentRequestId: string,
  reviewerId: string,
  reviewNote?: string,
) {
  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
  });

  if (!paymentRequest) {
    throw new Error("Payment request not found");
  }

  if (paymentRequest.status === "APPROVED") {
    throw new Error("Payment request is already approved");
  }

  if (paymentRequest.status === "REJECTED") {
    throw new Error("Cannot approve a rejected payment request. The client must submit a new one.");
  }

  // Self-approval prevention
  if (paymentRequest.clientUserId === reviewerId) {
    throw new Error("You cannot approve your own payment request");
  }

  const now = new Date();

  // Update payment request status
  const updated = await prisma.paymentRequest.update({
    where: { id: paymentRequestId },
    data: {
      status: "APPROVED",
      reviewNote: reviewNote ?? null,
      reviewedById: reviewerId,
      reviewedAt: now,
    },
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
    },
  });

  // Create audit log
  await prisma.paymentRequestAuditLog.create({
    data: {
      paymentRequestId,
      action: "APPROVED",
      performedById: reviewerId,
      note: reviewNote ?? "Payment approved",
    },
  });

  // Activate subscription
  await approveSubscription(
    paymentRequest.clientUserId,
    paymentRequest.plan,
    reviewerId,
  );

  // Notify client
  try {
    await createNotification({
      userId: paymentRequest.clientUserId,
      type: "PAYMENT_APPROVED",
      title: "Payment approved",
      body: `Your payment for ${paymentRequest.plan.replace(/_/g, " ")} has been approved. Your subscription is now active!`,
      link: "/client/subscription",
    });
  } catch {
    // Notification failure should not block approval
  }

  return updated;
}

export async function rejectPaymentRequest(
  paymentRequestId: string,
  reviewerId: string,
  reviewNote: string,
) {
  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
  });

  if (!paymentRequest) {
    throw new Error("Payment request not found");
  }

  if (paymentRequest.status === "APPROVED") {
    throw new Error("Cannot reject an approved payment request");
  }

  if (paymentRequest.status === "REJECTED") {
    throw new Error("Payment request is already rejected");
  }

  if (paymentRequest.clientUserId === reviewerId) {
    throw new Error("You cannot reject your own payment request");
  }

  const updated = await prisma.paymentRequest.update({
    where: { id: paymentRequestId },
    data: {
      status: "REJECTED",
      reviewNote,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.paymentRequestAuditLog.create({
    data: {
      paymentRequestId,
      action: "REJECTED",
      performedById: reviewerId,
      note: reviewNote,
    },
  });

  // Notify client
  try {
    await createNotification({
      userId: paymentRequest.clientUserId,
      type: "PAYMENT_REJECTED",
      title: "Payment rejected",
      body: `Your payment request was rejected. Reason: ${reviewNote}. Please submit a new payment with correct proof.`,
      link: "/client/subscription",
    });
  } catch {
    // Notification failure should not block rejection
  }

  return updated;
}

export async function requestPaymentProof(
  paymentRequestId: string,
  reviewerId: string,
  reviewNote: string,
) {
  const paymentRequest = await prisma.paymentRequest.findUnique({
    where: { id: paymentRequestId },
  });

  if (!paymentRequest) {
    throw new Error("Payment request not found");
  }

  if (paymentRequest.status === "APPROVED") {
    throw new Error("Cannot request proof for an approved payment request");
  }

  if (paymentRequest.status === "REJECTED") {
    throw new Error("Cannot request proof for a rejected payment request");
  }

  const updated = await prisma.paymentRequest.update({
    where: { id: paymentRequestId },
    data: {
      status: "PROOF_REQUESTED",
      reviewNote,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
    include: {
      clientUser: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.paymentRequestAuditLog.create({
    data: {
      paymentRequestId,
      action: "PROOF_REQUESTED",
      performedById: reviewerId,
      note: reviewNote,
    },
  });

  // Notify client
  try {
    await createNotification({
      userId: paymentRequest.clientUserId,
      type: "PAYMENT_PROOF_REQUESTED",
      title: "Updated payment proof needed",
      body: `Your payment proof needs updating. Reason: ${reviewNote}. Please submit a new payment proof.`,
      link: "/client/subscription",
    });
  } catch {
    // Notification failure should not block
  }

  return updated;
}
