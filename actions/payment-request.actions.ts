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
    console.error("submitPaymentRequestAction error:", error);
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
    console.error("adminApprovePaymentAction error:", error);
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
    console.error("adminRejectPaymentAction error:", error);
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
    console.error("adminRequestProofAction error:", error);
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
    console.error("coachApprovePaymentAction error:", error);
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
    console.error("coachRejectPaymentAction error:", error);
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
    console.error("coachRequestProofAction error:", error);
    return {
      success: false as const,
      error: {
        message: error instanceof Error ? error.message : "Failed to request proof",
      },
    };
  }
}
