"use server";

import { z } from "zod";
import { getAppUrl, getEmailFrom, getResendClient } from "@/lib/resend";

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

  if (!resend) {
    console.warn(
      `[free-guide] RESEND_API_KEY not configured. Guide requested by: ${email}`,
    );
    return { success: true };
  }

  const guideUrl = `${appUrl}/programs`;

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Your 5-Day Glute Activation Guide",
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
    console.error("[free-guide] Failed to send guide email:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }

  return { success: true };
}
