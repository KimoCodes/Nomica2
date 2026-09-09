import { NotificationType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/resend";
import { sendEmail } from "./email.service";
import {
  renderEmailTemplate,
  infoCard,
  textBlock,
  boldText,
  divider,
} from "./email-templates";
import logger from "@/lib/logger";

const APP_URL = getAppUrl();

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  sendEmail?: boolean;
};

type EmailNotificationInput = {
  userId: string;
  subject: string;
  title: string;
  subtitle?: string;
  content: string;
  action?: { label: string; url: string };
  footer?: string;
};

// ─── In-App Notification ──────────────────────────────────────────────────────

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });

  if (input.sendEmail !== false) {
    await sendNotificationEmail(input.userId, {
      userId: input.userId,
      subject: input.title,
      title: input.title,
      content: textBlock(input.body),
      action: input.link ? { label: "View Details", url: `${APP_URL}${input.link}` } : undefined,
    }).catch(() => {});
  }

  return notification;
}

export async function createBulkNotifications(
  inputs: CreateNotificationInput[],
) {
  return prisma.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    })),
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

// ─── Email Notifications ──────────────────────────────────────────────────────

async function sendNotificationEmail(userId: string, input: EmailNotificationInput) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, role: true },
    });

    if (!user?.email) return;

    const html = renderEmailTemplate({
      title: input.title,
      subtitle: input.subtitle,
      content: input.content,
      action: input.action,
      footer: input.footer,
    });

    await sendEmail(user.email, input.subject, html);
  } catch (err) {
    logger.error({ err, userId }, "Failed to send notification email");
  }
}

// ─── Notification Templates ───────────────────────────────────────────────────

// Program & Workout Notifications
export async function notifyProgramAssigned(clientUserId: string, programTitle: string, coachName: string) {
  await createNotification({
    userId: clientUserId,
    type: "WORKOUT_ASSIGNED",
    title: "New Program Assigned",
    body: `${coachName} assigned you "${programTitle}". Check it out!`,
    link: "/client/workouts",
    sendEmail: true,
  });
}

export async function notifyWorkoutCompleted(coachUserId: string, clientName: string, programTitle: string) {
  await createNotification({
    userId: coachUserId,
    type: "CHECK_IN_DUE",
    title: "Workout Completed",
    body: `${clientName} completed a workout in "${programTitle}".`,
    link: "/coach/clients",
    sendEmail: true,
  });
}

// Check-In Notifications
export async function notifyCheckInSubmitted(coachUserId: string, clientName: string) {
  await createNotification({
    userId: coachUserId,
    type: "CHECK_IN_DUE",
    title: "New Check-In",
    body: `${clientName} submitted their weekly check-in. Review it when you can.`,
    link: "/coach/check-ins",
    sendEmail: true,
  });
}

export async function notifyCheckInResponded(clientUserId: string, coachName: string) {
  await createNotification({
    userId: clientUserId,
    type: "CHECK_IN_DUE",
    title: "Coach Feedback",
    body: `${coachName} responded to your check-in. See what they said.`,
    link: "/client/check-ins",
    sendEmail: true,
  });
}

// Message Notifications
export async function notifyNewMessage(recipientUserId: string, senderName: string, preview: string) {
  await createNotification({
    userId: recipientUserId,
    type: "NEW_MESSAGE",
    title: `New message from ${senderName}`,
    body: preview.length > 100 ? preview.slice(0, 100) + "..." : preview,
    link: "/client/messages",
    sendEmail: false,
  });
}

// Payment & Subscription Notifications
export async function notifyPaymentSubmitted(clientUserId: string, amount: number, plan: string) {
  await createNotification({
    userId: clientUserId,
    type: "PAYMENT_SUBMITTED",
    title: "Payment Submitted",
    body: `Your payment of $${(amount / 100).toFixed(2)} for ${plan} has been submitted for review.`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifyPaymentApproved(clientUserId: string, amount: number, plan: string) {
  await createNotification({
    userId: clientUserId,
    type: "PAYMENT_APPROVED",
    title: "Payment Approved",
    body: `Your payment of $${(amount / 100).toFixed(2)} for ${plan} has been approved. Your subscription is now active!`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifyPaymentRejected(clientUserId: string, reason: string) {
  await createNotification({
    userId: clientUserId,
    type: "PAYMENT_REJECTED",
    title: "Payment Rejected",
    body: `Your payment was rejected. ${reason}`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifySubscriptionApproved(clientUserId: string, plan: string) {
  await createNotification({
    userId: clientUserId,
    type: "SUBSCRIPTION_APPROVED",
    title: "Subscription Activated",
    body: `Your ${plan} subscription is now active. Welcome to NomiTips All Access!`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifySubscriptionRevoked(clientUserId: string) {
  await createNotification({
    userId: clientUserId,
    type: "SUBSCRIPTION_REVOKED",
    title: "Subscription Revoked",
    body: "Your subscription has been revoked. Please contact support if you have questions.",
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifySubscriptionExpiring(clientUserId: string, daysLeft: number) {
  await createNotification({
    userId: clientUserId,
    type: "SUBSCRIPTION_EXPIRING",
    title: "Subscription Expiring Soon",
    body: `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew to keep access.`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

// Coach-Client Relationship Notifications
export async function notifyCoachAssigned(clientUserId: string, coachName: string) {
  await createNotification({
    userId: clientUserId,
    type: "COACH_ASSIGNED",
    title: "Coach Assigned",
    body: `${coachName} is now your coach. They'll help you reach your goals!`,
    link: "/client",
    sendEmail: true,
  });
}

export async function notifyNewClientAssigned(coachUserId: string, clientName: string) {
  await createNotification({
    userId: coachUserId,
    type: "COACH_ASSIGNED",
    title: "New Client",
    body: `${clientName} has been assigned to you as a new client.`,
    link: "/coach/clients",
    sendEmail: true,
  });
}

// Booking Notifications
export async function notifyBookingCreated(clientUserId: string, coachName: string, scheduledAt: Date) {
  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: clientUserId,
    type: "SESSION_BOOKED",
    title: "Session Booked",
    body: `Your session with ${coachName} is scheduled for ${dateStr}.`,
    link: "/client/sessions",
    sendEmail: true,
  });
}

export async function notifyBookingRequest(coachUserId: string, clientName: string, scheduledAt: Date) {
  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: coachUserId,
    type: "SESSION_BOOKED",
    title: "New Booking Request",
    body: `${clientName} requested a session on ${dateStr}.`,
    link: "/coach/sessions",
    sendEmail: true,
  });
}

// Session Notifications
export async function notifySessionConfirmed(recipientUserId: string, recipientRole: "client" | "coach", otherName: string, scheduledAt: Date) {
  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: recipientUserId,
    type: "SESSION_CONFIRMED",
    title: "Session Confirmed",
    body: `${otherName} confirmed your session on ${dateStr}.`,
    link: recipientRole === "client" ? "/client/sessions" : "/coach/sessions",
    sendEmail: true,
  });
}

export async function notifySessionCancelled(recipientUserId: string, recipientRole: "client" | "coach", otherName: string, reason?: string) {
  await createNotification({
    userId: recipientUserId,
    type: "SESSION_CANCELLED",
    title: "Session Cancelled",
    body: `${otherName} cancelled the session${reason ? `. Reason: ${reason}` : ""}.`,
    link: recipientRole === "client" ? "/client/sessions" : "/coach/sessions",
    sendEmail: true,
  });
}

export async function notifySessionRescheduled(recipientUserId: string, recipientRole: "client" | "coach", otherName: string, newScheduledAt: Date) {
  const dateStr = newScheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification({
    userId: recipientUserId,
    type: "SESSION_RESCHEDULED",
    title: "Session Rescheduled",
    body: `${otherName} rescheduled the session to ${dateStr}.`,
    link: recipientRole === "client" ? "/client/sessions" : "/coach/sessions",
    sendEmail: true,
  });
}

export async function notifySessionCompleted(clientUserId: string, coachName: string) {
  await createNotification({
    userId: clientUserId,
    type: "SESSION_COMPLETED",
    title: "Session Completed",
    body: `Your session with ${coachName} has been completed. Check your notes and next steps.`,
    link: "/client/sessions",
    sendEmail: true,
  });
}

// Plan Notifications
export async function notifyExercisePlanAssigned(clientUserId: string, coachName: string, planName: string) {
  await createNotification({
    userId: clientUserId,
    type: "EXERCISE_PLAN_ASSIGNED",
    title: "New Exercise Plan",
    body: `${coachName} created a personalized exercise plan for you: "${planName}".`,
    link: "/client/my-plan",
    sendEmail: true,
  });
}

export async function notifyNutritionPlanAssigned(clientUserId: string, coachName: string, planName: string) {
  await createNotification({
    userId: clientUserId,
    type: "NUTRITION_PLAN_ASSIGNED",
    title: "New Nutrition Plan",
    body: `${coachName} created a personalized nutrition plan for you: "${planName}".`,
    link: "/client/my-plan",
    sendEmail: true,
  });
}

export async function notifyPlanUpdated(recipientUserId: string, recipientRole: "client" | "coach", otherName: string, planName: string, planType: "exercise" | "nutrition") {
  await createNotification({
    userId: recipientUserId,
    type: "PLAN_UPDATED",
    title: `${planType === "exercise" ? "Exercise" : "Nutrition"} Plan Updated`,
    body: `${otherName} updated the ${planType} plan "${planName}".`,
    link: recipientRole === "client" ? "/client/my-plan" : "/coach/plans",
    sendEmail: false,
  });
}

export async function notifyPlanProgressUpdate(coachUserId: string, clientName: string, planName: string, planType: "exercise" | "nutrition") {
  await createNotification({
    userId: coachUserId,
    type: "PLAN_PROGRESS_UPDATE",
    title: "Client Progress Update",
    body: `${clientName} logged progress on their ${planType} plan "${planName}".`,
    link: "/coach/plans",
    sendEmail: false,
  });
}

// Free Trial Notifications
export async function notifyFreeTrialGranted(clientUserId: string, durationDays: number) {
  await createNotification({
    userId: clientUserId,
    type: "FREE_TRIAL_GRANTED",
    title: "Free Trial Activated",
    body: `You've been granted a ${durationDays}-day free trial of NomiTips All Access!`,
    link: "/client",
    sendEmail: true,
  });
}

export async function notifyFreeTrialExpiring(clientUserId: string, daysLeft: number) {
  await createNotification({
    userId: clientUserId,
    type: "FREE_TRIAL_EXPIRING",
    title: "Free Trial Expiring",
    body: `Your free trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Upgrade to keep access.`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

// Admin Notifications
export async function notifyCoachPendingApproval(adminUserIds: string[], coachName: string, coachEmail: string) {
  for (const adminId of adminUserIds) {
    await createNotification({
      userId: adminId,
      type: "COACH_ASSIGNED",
      title: "Coach Pending Approval",
      body: `${coachName} (${coachEmail}) is waiting for approval.`,
      link: "/admin/coaches",
      sendEmail: true,
    });
  }
}

export async function notifyCoachApproved(coachUserId: string) {
  await createNotification({
    userId: coachUserId,
    type: "SUBSCRIPTION_APPROVED",
    title: "Coach Account Approved",
    body: "Your coach account has been approved! You can now log in and start coaching.",
    link: "/coach",
    sendEmail: true,
  });
}

// Payment Proof Requested
export async function notifyPaymentProofRequested(clientUserId: string, reason: string) {
  await createNotification({
    userId: clientUserId,
    type: "PAYMENT_PROOF_REQUESTED",
    title: "Payment Proof Requested",
    body: `Additional proof is needed for your payment. ${reason}`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

// ─── Stripe Billing Notifications ─────────────────────────────────────────────

export async function notifyPaymentSucceeded(clientUserId: string, amount: number) {
  await createNotification({
    userId: clientUserId,
    type: "PAYMENT_APPROVED",
    title: "Payment Processed",
    body: `Your payment of $${(amount / 100).toFixed(2)} was processed successfully.`,
    link: "/client/subscription",
    sendEmail: false,
  });
}

export async function notifyPlanChanged(clientUserId: string, newPlan: string) {
  await createNotification({
    userId: clientUserId,
    type: "SUBSCRIPTION_APPROVED",
    title: "Plan Changed",
    body: `Your plan has been changed to ${newPlan.replace(/_/g, " ")}.`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifySubscriptionReactivated(clientUserId: string) {
  await createNotification({
    userId: clientUserId,
    type: "SUBSCRIPTION_APPROVED",
    title: "Subscription Reactivated",
    body: "Your subscription has been reactivated. You will continue to have access.",
    link: "/client/subscription",
    sendEmail: true,
  });
}

export async function notifyCancellationScheduled(clientUserId: string, endDate: Date) {
  const dateStr = endDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  await createNotification({
    userId: clientUserId,
    type: "SUBSCRIPTION_EXPIRING",
    title: "Cancellation Scheduled",
    body: `Your subscription will end on ${dateStr}. You can reactivate before then.`,
    link: "/client/subscription",
    sendEmail: true,
  });
}

// ─── Coach Notifications for Client Subscription Events ───────────────────────

export async function notifyCoachClientSubscribed(coachUserId: string, clientName: string, plan: string) {
  await createNotification({
    userId: coachUserId,
    type: "COACH_ASSIGNED",
    title: "Client Subscribed",
    body: `${clientName} has subscribed to ${plan.replace(/_/g, " ")}.`,
    link: "/coach/clients",
    sendEmail: false,
  });
}

export async function notifyCoachClientPaymentFailed(coachUserId: string, clientName: string) {
  await createNotification({
    userId: coachUserId,
    type: "COACH_ASSIGNED",
    title: "Client Payment Failed",
    body: `${clientName}'s subscription payment failed. They may lose access if not resolved.`,
    link: "/coach/clients",
    sendEmail: false,
  });
}

export async function notifyCoachClientCancelled(coachUserId: string, clientName: string) {
  await createNotification({
    userId: coachUserId,
    type: "COACH_ASSIGNED",
    title: "Client Subscription Cancelled",
    body: `${clientName} has cancelled their subscription.`,
    link: "/coach/clients",
    sendEmail: false,
  });
}

export async function notifyCoachClientPlanChanged(coachUserId: string, clientName: string, newPlan: string) {
  await createNotification({
    userId: coachUserId,
    type: "COACH_ASSIGNED",
    title: "Client Plan Changed",
    body: `${clientName} changed their plan to ${newPlan.replace(/_/g, " ")}.`,
    link: "/coach/clients",
    sendEmail: false,
  });
}
