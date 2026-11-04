import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/resend";
import { sendSmtpEmail } from "@/lib/smtp";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";
import { STRIPE_PAYMENT_TEST_PRODUCT_SLUG } from "@/constants/product-catalog";
import { infoCard, renderEmailTemplate, textBlock } from "./email-templates";

type EmailProvider = "resend" | "smtp" | "none";

export type PaymentEmailStatus =
  | "succeeded"
  | "failed"
  | "partially_refunded"
  | "refunded";

export type PaymentEmailNotice = {
  status: PaymentEmailStatus;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  reference: string;
  items: { name: string; amountCents?: number }[];
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export async function sendPaymentStatusEmail(
  email: string,
  notice: PaymentEmailNotice,
  audience: "customer" | "team",
  teamDashboardPath = "/admin/orders",
): Promise<{ sent: boolean }> {
  const statusLabels: Record<PaymentEmailStatus, string> = {
    succeeded: "Payment received",
    failed: "Payment failed",
    partially_refunded: "Payment partially refunded",
    refunded: "Payment refunded",
  };
  const title = statusLabels[notice.status];
  const amount = (notice.amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: notice.currency.toUpperCase(),
  });
  const badgeColors: Record<PaymentEmailStatus, { background: string; color: string }> = {
    succeeded: { background: "#0d2818", color: "#28b968" },
    failed: { background: "#2b1113", color: "#ff7c84" },
    partially_refunded: { background: "#2a210c", color: "#f2c45c" },
    refunded: { background: "#20242a", color: "#c5ced8" },
  };
  const badgeColor = badgeColors[notice.status];
  const itemRows = notice.items.map((item) => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid #1e2e24;color:#e8f0eb;font-size:14px;line-height:1.5;">
        ${escapeHtml(item.name)}
      </td>
      ${item.amountCents === undefined
        ? ""
        : `<td align="right" style="padding:12px 14px;border-bottom:1px solid #1e2e24;color:#e8f0eb;font-size:14px;white-space:nowrap;">${(item.amountCents / 100).toLocaleString("en-US", { style: "currency", currency: notice.currency.toUpperCase() })}</td>`}
    </tr>
  `).join("");
  const customerDetails = audience === "team"
    ? textBlock(
      `<strong style="color:#ffffff;">Customer</strong><br>${escapeHtml(notice.customerName)} · <a href="mailto:${encodeURIComponent(notice.customerEmail)}" style="color:#28b968;text-decoration:none;">${escapeHtml(notice.customerEmail)}</a>`,
    )
    : textBlock(
      notice.status === "succeeded"
        ? "Your payment has been securely processed. Here is your transaction summary."
        : "There has been an update to your payment. Here are the details for your records.",
    );
  const paymentTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#0d1610;border:1px solid #1e2e24;border-radius:12px;overflow:hidden;">
      ${itemRows}
    </table>
  `;
  const actionUrl = audience === "team"
    ? `${getAppUrl()}${teamDashboardPath}`
    : `${getAppUrl()}/client/orders`;
  const actionLabel = audience === "team" ? "View Orders" : "View Order";
  const paymentVerb = notice.status === "partially_refunded" || notice.status === "refunded"
    ? "Refunded"
    : "Total";
  const subtitle = audience === "team"
    ? `A customer payment was ${notice.status.replaceAll("_", " ")}.`
    : statusLabels[notice.status];

  return sendEmail(
    email,
    `${title} — NomiTips`,
    renderEmailTemplate({
      preheader: `${title}: ${amount}`,
      title,
      subtitle,
      content: [
        customerDetails,
        paymentTable,
        infoCard("Payment summary", [
          {
            label: "Status",
            value: `<span style="display:inline-block;padding:4px 10px;background-color:${badgeColor.background};color:${badgeColor.color};border-radius:20px;font-size:12px;font-weight:700;text-transform:capitalize;">${notice.status.replaceAll("_", " ")}</span>`,
          },
          { label: paymentVerb, value: amount },
          { label: "Reference", value: escapeHtml(notice.reference) },
        ]),
      ].join(""),
      action: { label: actionLabel, url: actionUrl },
      footer: "Questions about this payment? Reply to this email or contact support@nomitips.com.",
    }),
  );
}

function getEmailProvider(): EmailProvider {
  if (getResendClient()) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "none";
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ sent: boolean }> {
  const provider = getEmailProvider();

  if (provider === "resend") {
    const resend = getResendClient();
    const { error } = await resend!.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
    });

    if (error) {
      logger.error({ err: error, to, subject }, "Failed to send email via Resend");
      return { sent: false };
    }
    return { sent: true };
  }

  if (provider === "smtp") {
    const result = await sendSmtpEmail({ to, subject, html });
    return { sent: result.sent };
  }

  logger.warn({ to, subject }, "No email provider configured, skipping");
  return { sent: false };
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<{ sent: boolean }> {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;

  if (getEmailProvider() === "none") {
    logger.warn(
      { email, route: "email.service" },
      "No email provider configured, auto-verifying",
    );
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    return { sent: false };
  }

  return sendEmail(
    email,
    "Verify your NomiTips account",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome to NomiTips, ${name}!</h1>
        <p style="color: #444; line-height: 1.6;">
          Thanks for signing up. Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Verify email
        </a>
        <p style="color: #888; font-size: 14px;">
          This link expires in 24 hours. If you did not create an account, you can ignore this email.
        </p>
      </div>
    `,
  );
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: "client" | "coach",
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/${role === "coach" ? "coach" : "client"}`;

  return sendEmail(
    email,
    "You're all set on NomiTips",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">You're ready to go, ${name}!</h1>
        <p style="color: #444; line-height: 1.6;">
          Your ${role} profile is complete. Head to your dashboard to get started.
        </p>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Go to dashboard
        </a>
      </div>
    `,
  );
}

export async function sendCoachApprovalEmail(
  email: string,
  name: string,
): Promise<{ sent: boolean }> {
  const loginUrl = `${getAppUrl()}/login`;

  return sendEmail(
    email,
    "Your NomiTips coach account has been approved",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome aboard, ${name}!</h1>
        <p style="color: #444; line-height: 1.6;">
          Your coach account on NomiTips has been approved. You can now sign in and start coaching.
        </p>
        <a href="${loginUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Sign in to your dashboard
        </a>
      </div>
    `,
  );
}

export async function sendAdminNewUserNotification({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: "CLIENT" | "COACH" | string;
}): Promise<{ sent: boolean }> {
  const defaultCoachEmails = [
    "nomitipscoaching@gmail.com",
    "bahatsinoellabra@gmail.com",
    "noella.bahatsi@tstech.com",
  ];

  const adminEmails = [
    process.env.ADMIN_EMAIL ?? "batsindakeynesbenoit10101@gmail.com",
    ...((process.env.COACH_NOTIFICATION_EMAILS ?? defaultCoachEmails.join(","))
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)),
  ];

  const roleLabel = role === "COACH" ? "Coach" : "Client";
  const recipients = [...new Set(adminEmails.filter(Boolean))];

  let sent = false;

  for (const recipient of recipients) {
    const result = await sendEmail(
      recipient,
      `New ${roleLabel} registration — NomiTips`,
      `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">New account signup</h1>
          <p style="color: #444; line-height: 1.6; margin: 0 0 16px;">
            A new ${roleLabel.toLowerCase()} account was created on NomiTips.
          </p>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; width: 120px;">Name</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600;">Role</td>
              <td style="padding: 12px;">${roleLabel}</td>
            </tr>
          </table>
        </div>
      `,
    );
    sent = sent || result.sent;
  }

  return { sent };
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  order: {
    id: string;
    totalCents: number;
    currency: string;
    items: { productName: string; productSlug?: string; lineTotalCents: number }[];
  },
): Promise<{ sent: boolean }> {
  const ordersUrl = `${getAppUrl()}/client/orders`;
  const programsUrl = `${getAppUrl()}/client/programs`;
  const total = (order.totalCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: order.currency.toUpperCase(),
  });
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid #1e2e24;color:#e8f0eb;font-size:14px;">${escapeHtml(item.productName)}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #1e2e24;text-align:right;color:#e8f0eb;font-size:14px;white-space:nowrap;">
            ${(item.lineTotalCents / 100).toLocaleString("en-US", { style: "currency", currency: order.currency.toUpperCase() })}
          </td>
        </tr>`,
    )
    .join("");
  const paymentTestOnly = order.items.some(
    (item) => item.productSlug === STRIPE_PAYMENT_TEST_PRODUCT_SLUG,
  );

  return sendEmail(
    email,
    "Your NomiTips purchase is confirmed",
    renderEmailTemplate({
      preheader: `Purchase confirmed — ${total}`,
      title: `Thank you, ${escapeHtml(name)}!`,
      subtitle: paymentTestOnly
        ? "Your payment test is confirmed."
        : "Your purchase is confirmed and your programs are ready.",
      content: [
        textBlock(paymentTestOnly
          ? "This test product does not include workouts or training materials."
          : "Your one-time payment is complete. Your purchased programs are ready in your library."),
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#0d1610;border:1px solid #1e2e24;border-radius:12px;overflow:hidden;">${itemRows}</table>`,
        infoCard("Order summary", [
          { label: "Payment status", value: '<span style="color:#28b968;font-weight:700;">Confirmed</span>' },
          { label: "Total paid", value: total },
          { label: "Order reference", value: escapeHtml(order.id) },
        ]),
        textBlock("One-time purchase · No recurring charges."),
      ].join(""),
      action: paymentTestOnly
        ? { label: "View Order", url: ordersUrl }
        : { label: "Open My Programs", url: programsUrl },
      footer: "Need help with your order? Contact support@nomitips.com.",
    }),
  );
}

export async function sendFreeTrialGrantedEmail(
  email: string,
  name: string,
  durationDays: number,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/client`;

  return sendEmail(
    email,
    "You've received a free trial on NomiTips!",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Free Trial Activated!</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${name}, great news! You've been granted a ${durationDays}-day free trial of NomiTips All Access.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
          <p style="color: #166534; font-weight: 500; margin: 0;">
            Your trial includes full access to all programs, workouts, and features.
          </p>
        </div>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Start Your Trial
        </a>
        <p style="color: #888; font-size: 14px;">
          No credit card required. You can upgrade to a paid plan anytime.
        </p>
      </div>
    `,
  );
}

export async function sendCoachNewClientEmail(
  coachEmail: string,
  coachName: string,
  clientName: string,
  clientEmail: string,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/coach/clients`;

  return sendEmail(
    coachEmail,
    `New client: ${clientName}`,
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">New Client Assigned</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${coachName}, a new client has been assigned to you:
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f9f9f9; border-radius: 12px;">
          <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${clientName}</p>
          <p style="margin: 0;"><strong>Email:</strong> ${clientEmail}</p>
        </div>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          View Clients
        </a>
      </div>
    `,
  );
}

// ─── Session Emails ──────────────────────────────────────────────────────────

export async function sendSessionBookedEmail(
  email: string,
  name: string,
  otherName: string,
  scheduledAt: Date,
  role: "client" | "coach",
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/${role === "client" ? "client" : "coach"}/sessions`;
  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return sendEmail(
    email,
    role === "client" ? "Session Booked" : "New Booking Request",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">${role === "client" ? "Session Booked" : "New Booking Request"}</h1>
        <p style="color: #444; line-height: 1.6;">
          ${role === "client"
            ? `Your session with ${otherName} is scheduled for ${dateStr}.`
            : `${otherName} requested a session on ${dateStr}.`
          }
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f9f9f9; border-radius: 12px;">
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateStr}</p>
        </div>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          View Sessions
        </a>
      </div>
    `,
  );
}

export async function sendSessionConfirmedEmail(
  email: string,
  name: string,
  otherName: string,
  scheduledAt: Date,
): Promise<{ sent: boolean }> {
  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return sendEmail(
    email,
    "Session Confirmed",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Session Confirmed</h1>
        <p style="color: #444; line-height: 1.6;">
          ${otherName} confirmed your session on ${dateStr}.
        </p>
      </div>
    `,
  );
}

export async function sendSessionCancelledEmail(
  email: string,
  name: string,
  otherName: string,
  reason?: string,
): Promise<{ sent: boolean }> {
  return sendEmail(
    email,
    "Session Cancelled",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Session Cancelled</h1>
        <p style="color: #444; line-height: 1.6;">
          ${otherName} cancelled the session${reason ? `. Reason: ${reason}` : ""}.
        </p>
      </div>
    `,
  );
}

// ─── Plan Emails ─────────────────────────────────────────────────────────────

export async function sendExercisePlanAssignedEmail(
  email: string,
  clientName: string,
  coachName: string,
  planName: string,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/client/my-plan`;

  return sendEmail(
    email,
    "New Exercise Plan Assigned",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">New Exercise Plan</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${clientName}, ${coachName} created a personalized exercise plan for you: "${planName}".
        </p>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          View Your Plan
        </a>
      </div>
    `,
  );
}

export async function sendNutritionPlanAssignedEmail(
  email: string,
  clientName: string,
  coachName: string,
  planName: string,
): Promise<{ sent: boolean }> {
  const dashboardUrl = `${getAppUrl()}/client/my-plan`;

  return sendEmail(
    email,
    "New Nutrition Plan Assigned",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">New Nutrition Plan</h1>
        <p style="color: #444; line-height: 1.6;">
          Hi ${clientName}, ${coachName} created a personalized nutrition plan for you: "${planName}".
        </p>
        <a href="${dashboardUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          View Your Plan
        </a>
      </div>
    `,
  );
}

// ─── Password Reset ──────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<{ sent: boolean }> {
  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  return sendEmail(
    email,
    "Reset your NomiTips password",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Password Reset</h1>
        <p style="color: #444; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 14px;">
          This link expires in 1 hour. If you did not request a password reset, you can ignore this email.
        </p>
      </div>
    `,
  );
}
