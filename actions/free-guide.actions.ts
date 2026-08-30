"use server";

import { z } from "zod";
import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/resend";
import { sendSmtpEmail } from "@/lib/smtp";

import logger from "@/lib/logger";

const freeGuideSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
});

export async function sendFreeGuideAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const raw = {
    email: formData.get("email"),
  };

  const parsed = freeGuideSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email address",
    };
  }

  const { email } = parsed.data;
  const resend = getResendClient();
  const appUrl = getAppUrl();
  const guideUrl = `${appUrl}/programs`;

  const subject = "Your 5-Day Glute Activation Guide";

  const smtpHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#0a0f0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0f0d;"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#111a14;border-radius:16px;border:1px solid #1e2e24;overflow:hidden;"><tr><td align="center" style="padding:40px 30px 20px;"><div style="font-family:Georgia,serif;font-size:42px;color:#fff;letter-spacing:2px;"><span style="font-style:italic;">N</span>omi<span style="color:#28b968;">Tips</span></div></td></tr><tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(90deg,transparent,#28b968,transparent);"></div></td></tr><tr><td style="padding:30px 40px 10px;"><h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#fff;line-height:1.3;">Your 5-Day Glute Guide 💪</h1><p style="margin:0 0 16px;font-size:16px;color:#a8c4b8;line-height:1.7;">Here is your free 5-Day Glute Activation Guide! This program will help you wake up dormant glute muscles and build a strong foundation.</p></td></tr><tr><td style="padding:10px 40px;"><div style="background:#0d1610;border:1px solid #1e2e24;border-radius:12px;padding:24px;"><p style="margin:0 0 14px;font-size:14px;color:#28b968;font-weight:700;letter-spacing:1px;text-transform:uppercase;">What's Inside</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Day 1-2: Glute Activation exercises</td></tr><tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Day 3-4: Strength Building movements</td></tr><tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Day 5: High-Intensity Challenge workout</td></tr><tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Bonus: Recovery and mobility routines</td></tr><tr><td style="padding:6px 0;color:#a8c4b8;font-size:15px;">✦&nbsp; Video tutorials for every exercise</td></tr></table></div></td></tr><tr><td align="center" style="padding:30px 40px;"><a href="${guideUrl}" style="display:inline-block;background:#28b968;color:#0a0f0d;text-decoration:none;border-radius:10px;padding:14px 32px;font-size:15px;font-weight:700;">Explore Programs</a></td></tr><tr><td style="padding:0 40px 10px;"><div style="height:1px;background:#1e2e24;"></div></td></tr><tr><td style="padding:10px 40px 30px;"><p style="margin:0;font-size:12px;color:#4a6356;text-align:center;">If you did not request this guide, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;

  if (!resend) {
    logger.warn({ action: "sendFreeGuideAction", email }, "RESEND_API_KEY not configured, using SMTP fallback");
    try {
      await sendSmtpEmail({ to: email, subject, html: smtpHtml });
      return { success: true };
    } catch (smtpError) {
      logger.error({ err: smtpError, action: "sendFreeGuideAction" }, "SMTP fallback failed");
      return { success: false, error: "Failed to send email. Please try again." };
    }
  }

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Your 5-Day Glute Guide</h1>
        <p style="color: #444; line-height: 1.6;">
          Here is your free 5-Day Glute Activation Guide! This program will help you
          wake up dormant glute muscles and build a strong foundation.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #f9f9f9; border-radius: 12px;">
          <h2 style="font-size: 18px; margin-bottom: 12px;">What is Inside:</h2>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px;">
            <li>Day 1-2: Glute Activation exercises</li>
            <li>Day 3-4: Strength Building movements</li>
            <li>Day 5: High-Intensity Challenge workout</li>
            <li>Bonus: Recovery and mobility routines</li>
            <li>Video tutorials for every exercise</li>
          </ul>
        </div>
        <p style="color: #444; line-height: 1.6;">
          Ready to take your training to the next level? Explore our full programs
          designed specifically for women who want to build strength and confidence.
        </p>
        <a href="${guideUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background: #171717; color: #fff; text-decoration: none;
                  border-radius: 8px; font-weight: 500;">
          Explore Programs
        </a>
        <p style="color: #888; font-size: 14px;">
          If you did not request this guide, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    logger.error({ err: error, action: "sendFreeGuideAction" }, "Failed to send guide email");
    return { success: false, error: "Failed to send email. Please try again." };
  }

  return { success: true };
}
