"use server";

import { z } from "zod";
import { sendSmtpEmail } from "@/lib/smtp";
import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/resend";
import logger from "@/lib/logger";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
});

export async function subscribeToEarlyAccess(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const raw = { email: formData.get("email") };
  const parsed = subscribeSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email address",
    };
  }

  const { email } = parsed.data;

  // Try to save subscriber to database (optional - table may not exist yet)
  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.earlyAccessSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: true }; // Already subscribed
    }

    await prisma.earlyAccessSubscriber.create({
      data: { email },
    });
  } catch (error) {
    // Database may not be available - continue with email sending
    logger.warn({ err: error, email }, "Could not save subscriber to database, continuing with email");
  }

  // Send confirmation email to subscriber
  try {
    const appUrl = getAppUrl();
    const dashboardUrl = `${appUrl}/coming-soon`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background-color:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0f0d;">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;">
                <tr>
                  <td align="center" style="padding:40px 30px 20px;">
                    <div style="font-family:Georgia,serif;font-size:42px;color:#ffffff;letter-spacing:2px;">
                      <span style="font-style:italic;">N</span>omi<span style="color:#28b968;">Tips</span>
                    </div>
                    <p style="margin:8px 0 0;font-size:11px;color:#4a6356;letter-spacing:3px;text-transform:uppercase;">Fitness Platform</p>
                  </td>
                </tr>
                <tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,#28b968,transparent);"></div></td></tr>
                <tr>
                  <td style="padding:30px 40px 10px;">
                    <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">Welcome to the Family 🎉</h1>
                    <p style="margin:0 0 16px;font-size:16px;color:#a8c4b8;line-height:1.7;">
                      You're officially on the NomiTips early access list. We're building something special — a premium fitness experience designed specifically for women who want real, lasting results.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 40px;">
                    <div style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:12px;padding:24px;">
                      <p style="margin:0 0 14px;font-size:14px;color:#28b968;font-weight:700;letter-spacing:1px;text-transform:uppercase;">What's Coming</p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Custom workout programs</td></tr>
                        <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; 1-on-1 coaching support</td></tr>
                        <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Nutrition planning tools</td></tr>
                        <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Progress tracking & analytics</td></tr>
                        <tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Community & transformation support</td></tr>
                      </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px 10px;">
                    <div style="background:linear-gradient(135deg,#0d1610 0%,#142218 100%);border:1px solid #28b968;border-radius:12px;padding:24px;text-align:center;">
                      <p style="margin:0 0 8px;font-size:24px;">🎁</p>
                      <p style="margin:0 0 8px;font-size:16px;color:#ffffff;font-weight:700;">Early Subscriber Exclusive</p>
                      <p style="margin:0;font-size:14px;color:#28b968;font-weight:600;">You'll receive a special launch reward when we go live</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:30px 40px;">
                    <a href="${dashboardUrl}" style="display:inline-block;background-color:#28b968;color:#0a0f0d;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:700;letter-spacing:0.5px;">Visit NomiTips</a>
                  </td>
                </tr>
                <tr><td style="padding:0 40px 10px;"><div style="height:1px;background-color:#1e2e24;"></div></td></tr>
                <tr>
                  <td style="padding:10px 40px 30px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#4a6356;text-align:center;">You're receiving this because you joined the NomiTips launch list.</p>
                    <p style="margin:0;font-size:12px;color:#4a6356;text-align:center;">NomiTips &copy; 2026 &middot; All rights reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (resend) {
      await resend.emails.send({
        from: getEmailFrom(),
        to: email,
        subject: "Welcome to NomiTips Early Access!",
        html,
      });
    } else if (process.env.SMTP_HOST) {
      await sendSmtpEmail({
        to: email,
        subject: "Welcome to NomiTips Early Access!",
        html,
      });
    }

    logger.info({ email }, "Early access confirmation email sent");
  } catch (error) {
    logger.error({ err: error, email }, "Failed to send early access confirmation email");
  }

  // Notify admin
  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "batsindakeynesbenoit10101@gmail.com";
    const adminHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background-color:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0f0d;">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;">
                <tr>
                  <td style="padding:30px 40px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#4a6356;letter-spacing:2px;text-transform:uppercase;">NomiTips Admin</p>
                    <h1 style="margin:0 0 20px;font-size:22px;color:#ffffff;">New Early Access Signup</h1>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0d1610;border:1px solid #1e2e24;border-radius:10px;">
                      <tr>
                        <td style="padding:14px 16px;color:#4a6356;width:100px;font-size:14px;">Email</td>
                        <td style="padding:14px 16px;color:#ffffff;font-weight:600;font-size:14px;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 16px;color:#4a6356;border-top:1px solid #1e2e24;font-size:14px;">Date</td>
                        <td style="padding:14px 16px;color:#ffffff;border-top:1px solid #1e2e24;font-size:14px;">${new Date().toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const resend = getResendClient();
    if (resend) {
      await resend.emails.send({
        from: getEmailFrom(),
        to: adminEmail,
        subject: "New Early Access Signup — NomiTips",
        html: adminHtml,
      });
    } else if (process.env.SMTP_HOST) {
      await sendSmtpEmail({
        to: adminEmail,
        subject: "New Early Access Signup — NomiTips",
        html: adminHtml,
      });
    }
  } catch (error) {
    logger.error({ err: error, email }, "Failed to send admin notification for early access signup");
  }

  return { success: true };
}
