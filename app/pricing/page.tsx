"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, formatPlanPrice, formatPrice } from "@/constants/subscriptions";
import { CheckoutButton } from "@/components/checkout-button";
import { PublicLayout } from "@/components/shared/public-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  CreditCard,
  X,
} from "lucide-react";

export default function PricingPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Zap className="mr-1 size-3" />
            All Access Membership
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Start your transformation
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock every program, workout, nutrition plan, and coaching tool.
            Choose the plan that works for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.priceCents)}
                  </span>
                  <span className="text-muted-foreground">
                    / {plan.interval}
                  </span>
                </div>

                <ul className="mb-6 space-y-3 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  type="subscription"
                  plan={plan.id === "ALL_ACCESS_MONTHLY" ? "monthly" : "annual"}
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                  onError={setError}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center text-sm text-destructive max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {/* Trust Signals */}
        <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto mb-16">
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Secure payments</p>
            <p className="text-xs text-muted-foreground">
              Powered by Stripe. Your payment info is never stored on our servers.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Cancel anytime</p>
            <p className="text-xs text-muted-foreground">
              No contracts, no hidden fees. Cancel your subscription anytime.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Instant access</p>
            <p className="text-xs text-muted-foreground">
              Start training immediately after subscribing.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I switch between monthly and annual?",
                a: "Yes. You can upgrade or downgrade anytime from your account settings. Plan changes take effect with prorated billing.",
              },
              {
                q: "What happens when I cancel?",
                a: "Your access continues until the end of your current billing period. After that, your subscription expires and you lose access to premium features.",
              },
              {
                q: "Is there a free trial?",
                a: "Your coach or admin can grant you a free trial. Ask your coach about trial availability.",
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit and debit cards through Stripe. Your payment details are securely handled by Stripe and never touch our servers.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg border p-4">
                <p className="font-medium text-sm">{faq.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Already have an account?</p>
          <Link href="/login">
            <Button variant="outline">
              Log in
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
