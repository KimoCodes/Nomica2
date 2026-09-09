"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <XCircle className="size-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Payment cancelled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No worries — you haven&apos;t been charged. You can try again
            whenever you&apos;re ready.
          </p>

          <div className="mt-6 flex gap-3">
            <Link href="/pricing">
              <Button>
                <CreditCard className="mr-2 size-4" />
                View Plans
              </Button>
            </Link>
            <Link href="/client">
              <Button variant="outline">
                <ArrowLeft className="mr-2 size-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
