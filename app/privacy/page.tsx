import type { Metadata } from "next";
import { PublicLayout } from "@/components/shared/public-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NOMICA Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: August 4, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Account information (name, email, password)</li>
                <li>Profile data (age, gender, height, weight, fitness goals)</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Workout data (programs, completions, measurements)</li>
                <li>Communications with coaches and other users</li>
                <li>Progress photos and media you upload</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                2. How We Use Your Information
              </h2>
              <p className="mb-3">
                We use your information to:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative notifications (account, security)</li>
                <li>Communicate with coaches within the platform</li>
                <li>Personalize your experience and provide recommendations</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                3. Data Sharing
              </h2>
              <p>
                We do not sell your personal information. We share data only with
                service providers who assist in operating the platform (hosting,
                payment processing, email delivery), and as required by law. Your
                workout data is shared with your assigned coach within the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                4. Data Security
              </h2>
              <p>
                We implement industry-standard security measures including
                encryption in transit (TLS) and at rest, secure authentication,
                and regular security audits. However, no method of transmission
                over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                5. Data Retention
              </h2>
              <p>
                We retain your account data for as long as your account is active.
                If you delete your account, we will remove your personal
                information within 30 days, except where required by law or for
                legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                6. Your Rights
              </h2>
              <p className="mb-3">
                You have the right to:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                7. Cookies
              </h2>
              <p>
                We use essential cookies to maintain your session and preferences.
                We do not use third-party advertising cookies. You can manage
                cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                8. Children&apos;s Privacy
              </h2>
              <p>
                The Service is not intended for children under 18. We do not
                knowingly collect personal information from children. If you
                believe we have collected data from a child, contact us
                immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of material changes by posting the updated policy on
                this page with a revised &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                10. Contact Us
              </h2>
              <p>
                For privacy-related inquiries, contact us at{" "}
                <a
                  href="mailto:privacy@nomica.app"
                  className="text-primary hover:underline"
                >
                  privacy@nomica.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
