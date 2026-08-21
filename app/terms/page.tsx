import type { Metadata } from "next";
import { PublicLayout } from "@/components/shared/public-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NOMICA Terms of Service — the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: August 4, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the NOMICA platform (&quot;Service&quot;), you agree
                to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree
                to these Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                2. Description of Service
              </h2>
              <p>
                NOMICA provides a digital fitness coaching platform that includes
                workout programs, exercise video libraries, progress tracking tools,
                nutrition resources, and communication with coaches. The Service is
                delivered through our website and associated applications.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                3. Account Registration
              </h2>
              <p>
                You must provide accurate and complete information when creating an
                account. You are responsible for maintaining the confidentiality of
                your credentials and for all activities under your account. You must
                be at least 18 years old to use the Service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                4. Purchases and Subscriptions
              </h2>
              <p>
                One-time purchases grant lifetime access to the purchased program or
                bundle. Subscriptions (All-Access Monthly or Annual) provide access
                to the full catalog for the duration of the billing period. Prices
                are listed in USD and do not include applicable taxes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                5. Refund Policy
              </h2>
              <p>
                We offer a 30-day money-back guarantee on all purchases. If you are
                not satisfied with your purchase, contact us within 30 days for a
                full refund. Refund requests can be made through your account
                dashboard or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                6. User Conduct
              </h2>
              <p>
                You agree not to share your account credentials, redistribute or
                resell program content, use the Service for any unlawful purpose, or
                attempt to access other users&apos; accounts or data.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                7. Intellectual Property
              </h2>
              <p>
                All content on the Service, including workout programs, videos,
                images, text, and software, is the property of NOMICA or its
                content providers and is protected by copyright and trademark laws.
                You may not reproduce, distribute, or create derivative works without
                our express written permission.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                8. Health Disclaimer
              </h2>
              <p>
                The Service is for informational and educational purposes only. It
                is not a substitute for professional medical advice, diagnosis, or
                treatment. Consult a qualified healthcare provider before beginning
                any exercise program. You assume all risks associated with physical
                activity.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                9. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, NOMICA shall not be liable
                for any indirect, incidental, special, consequential, or punitive
                damages, or any loss of profits or revenues, whether incurred
                directly or indirectly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                10. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes
                will be effective upon posting. Your continued use of the Service
                after changes are posted constitutes acceptance of the modified
                Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                11. Contact
              </h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a
                  href="mailto:support@nomica.app"
                  className="text-primary hover:underline"
                >
                  support@nomica.app
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
