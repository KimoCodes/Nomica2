import type { Metadata } from "next";
import { PublicLayout } from "@/components/shared/public-layout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "NOMICA Refund Policy — 30-day money-back guarantee on all purchases.",
};

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      <main className="flex flex-1 flex-col px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Refund Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: August 4, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                30-Day Money-Back Guarantee
              </h2>
              <p>
                We stand behind our programs with a 30-day money-back guarantee.
                If you are not satisfied with your purchase for any reason, you
                can request a full refund within 30 days of your purchase date.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                How to Request a Refund
              </h2>
              <p className="mb-3">
                You can request a refund through any of these methods:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>Dashboard:</strong> Go to your subscription or purchase
                  history and click &quot;Request Refund&quot;
                </li>
                <li>
                  <strong>Email:</strong> Send a request to{" "}
                  <a
                    href="mailto:support@nomica.app"
                    className="text-primary hover:underline"
                  >
                    support@nomica.app
                  </a>{" "}
                  with your account email and reason for the refund
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                What&apos;s Included
              </h2>
              <p className="mb-3">
                Our 30-day guarantee covers:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>One-time program purchases</li>
                <li>Bundle purchases</li>
                <li>Monthly subscriptions (first month only)</li>
                <li>Annual subscriptions (pro-rated within first 30 days)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Refund Processing
              </h2>
              <p>
                Refunds are processed within 5-10 business days to the original
                payment method. You will receive an email confirmation when your
                refund has been processed. Your access to the Service will be
                revoked upon refund completion.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Exceptions
              </h2>
              <p className="mb-3">
                Refunds may not be available in the following cases:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Requests made after 30 days from purchase</li>
                <li>Accounts that have violated our Terms of Service</li>
                <li>Duplicate refund requests for the same purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Subscription Cancellations
              </h2>
              <p>
                You can cancel your subscription at any time from your account
                dashboard. Cancellation takes effect at the end of your current
                billing period. You will retain access until that date. No partial
                refunds are issued for mid-period cancellations after the initial
                30-day period.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Contact
              </h2>
              <p>
                For refund-related questions, contact us at{" "}
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
