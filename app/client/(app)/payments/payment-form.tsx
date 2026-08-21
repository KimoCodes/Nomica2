"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@prisma/client";
import { submitPaymentRequestAction } from "@/actions/payment-request.actions";
import { PLANS, formatPlanPrice } from "@/constants/subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Upload,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileImage,
  X,
} from "lucide-react";

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Mobile Money",
  "Cash",
  "PayPal",
  "Other",
];

type Props = {
  currentSubscription?: {
    status: string;
    plan: SubscriptionPlan;
  } | null;
};

export function PaymentForm({ currentSubscription }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const [plan, setPlan] = useState<SubscriptionPlan>("ALL_ACCESS_MONTHLY");
  const [amount, setAmount] = useState(
    plan === "ALL_ACCESS_MONTHLY" ? "14.99" : "149.99",
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");

  function handlePlanChange(value: string) {
    const newPlan = value as SubscriptionPlan;
    setPlan(newPlan);
    setAmount(newPlan === "ALL_ACCESS_MONTHLY" ? "14.99" : "149.99");
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setProofUrl(data.url);
      setProofFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveProof() {
    setProofUrl(null);
    setProofFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!proofUrl) {
      setError("Please upload payment proof");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setIsPending(true);

    const result = await submitPaymentRequestAction({
      plan,
      amount: Math.round(parseFloat(amount) * 100),
      paymentMethod,
      transactionRef: transactionRef || undefined,
      proofUrl,
      proofFileName: proofFile?.name || undefined,
      notes: notes || undefined,
    });

    if (!result.success) {
      setError(result.error.message);
      setIsPending(false);
      return;
    }

    setSuccess(true);
    setIsPending(false);
    router.refresh();
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 size-12 text-success" />
          <h3 className="text-lg font-semibold">Payment Request Submitted</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment request has been submitted for review. You will be
            notified once it&apos;s reviewed by your coach or an administrator.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setSuccess(false);
              setProofUrl(null);
              setProofFile(null);
              setTransactionRef("");
              setNotes("");
            }}
          >
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}

      {currentSubscription?.status === "active" && (
        <div aria-live="polite" className="flex items-center gap-2 rounded-lg border border-success/50 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="size-4" />
          You already have an active subscription ({currentSubscription.plan.replace("_", " ")}).
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlanChange(p.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  plan === p.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 text-2xl font-bold">{formatPlanPrice(p)}</p>
                {p.highlighted && (
                  <p className="mt-1 text-xs text-primary font-medium">
                    {p.badge}
                  </p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionRef">
              Transaction / Reference Number{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="transactionRef"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. TXN-123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about your payment..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Proof</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a bank slip, mobile money receipt, transaction screenshot, or
            other payment evidence.
          </p>

          {proofUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
              <FileImage className="size-8 text-success" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {proofFile?.name ?? "Payment proof"}
                </p>
                <p className="text-xs text-success">Uploaded successfully</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveProof}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
              <Upload className="mb-3 size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">Click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPEG, PNG, WebP, or PDF (max 10MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={uploading}
              />
              {uploading && (
                <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          loading={isPending}
          loadingText="Submitting..."
          size="lg"
          disabled={!proofUrl || !paymentMethod}
        >
          Submit Payment Request
        </LoadingButton>
      </div>
    </form>
  );
}
