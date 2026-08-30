"use server";

import { SubscriptionPlan, Role } from "@prisma/client";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  submitPaymentRequest,
  approvePaymentRequest,
  rejectPaymentRequest,
  requestPaymentProof,
} from "@/server/services/payment-request.service";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

type SubmitPaymentInput = {
  plan: SubscriptionPlan;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  proofUrl: string;
  proofFileName?: string;
  notes?: string;
};

export async function submitPaymentRequestAction(input: SubmitPaymentInput) {
  try {
    const session = await requireAuth();

    if (input.amount <= 0) {
      return { success: false as const, error: { message: "Amount must be greater than zero" } };
    }

    await submitPaymentRequest(session.user.id, input);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "submitPaymentRequestAction" }, "Failed to submit payment request");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to submit payment request",
      },
    };
  }
}

export async function adminApprovePaymentAction(
  paymentRequestId: string,
  reviewNote?: string,
) {
  try {
    const session = await requireRole([Role.ADMIN]);
    await approvePaymentRequest(paymentRequestId, session.user.id, reviewNote);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "adminApprovePaymentAction" }, "Failed to approve payment");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to approve payment",
      },
    };
  }
}

export async function adminRejectPaymentAction(
  paymentRequestId: string,
  reviewNote: string,
) {
  try {
    const session = await requireRole([Role.ADMIN]);
    await rejectPaymentRequest(paymentRequestId, session.user.id, reviewNote);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "adminRejectPaymentAction" }, "Failed to reject payment");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to reject payment",
      },
    };
  }
}

export async function adminRequestProofAction(
  paymentRequestId: string,
  reviewNote: string,
) {
  try {
    const session = await requireRole([Role.ADMIN]);
    await requestPaymentProof(paymentRequestId, session.user.id, reviewNote);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "adminRequestProofAction" }, "Failed to request proof");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to request proof",
      },
    };
  }
}

export async function coachApprovePaymentAction(
  paymentRequestId: string,
  reviewNote?: string,
) {
  try {
    const session = await requireRole([Role.COACH]);

    // Verify the payment request belongs to this coach's client
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      select: { coachUserId: true },
    });

    if (!paymentRequest) {
      return { success: false as const, error: { message: "Payment request not found" } };
    }

    if (paymentRequest.coachUserId !== session.user.id) {
      return { success: false as const, error: { message: "You can only review payments from your own clients" } };
    }

    await approvePaymentRequest(paymentRequestId, session.user.id, reviewNote);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "coachApprovePaymentAction" }, "Failed to approve payment");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to approve payment",
      },
    };
  }
}

export async function coachRejectPaymentAction(
  paymentRequestId: string,
  reviewNote: string,
) {
  try {
    const session = await requireRole([Role.COACH]);

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      select: { coachUserId: true },
    });

    if (!paymentRequest) {
      return { success: false as const, error: { message: "Payment request not found" } };
    }

    if (paymentRequest.coachUserId !== session.user.id) {
      return { success: false as const, error: { message: "You can only review payments from your own clients" } };
    }

    await rejectPaymentRequest(paymentRequestId, session.user.id, reviewNote);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "coachRejectPaymentAction" }, "Failed to reject payment");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to reject payment",
      },
    };
  }
}

export async function coachRequestProofAction(
  paymentRequestId: string,
  reviewNote: string,
) {
  try {
    const session = await requireRole([Role.COACH]);

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      select: { coachUserId: true },
    });

    if (!paymentRequest) {
      return { success: false as const, error: { message: "Payment request not found" } };
    }

    if (paymentRequest.coachUserId !== session.user.id) {
      return { success: false as const, error: { message: "You can only review payments from your own clients" } };
    }

    await requestPaymentProof(paymentRequestId, session.user.id, reviewNote);
    return { success: true as const };
  } catch (error) {
    logger.error({ err: error, action: "coachRequestProofAction" }, "Failed to request proof");
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to request proof",
      },
    };
  }
}
