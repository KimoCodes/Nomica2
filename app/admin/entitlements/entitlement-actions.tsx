"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  grantEntitlementAction,
  revokeEntitlementAction,
} from "@/actions/order-admin.actions";
import { trackLoading } from "@/components/ui/loading-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";

type ProductOption = {
  id: string;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export function EntitlementManager({
  productOptions,
}: {
  productOptions: ProductOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const grantable = productOptions.filter((p) => p.status !== "DRAFT");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userEmail = (formData.get("userEmail") as string)?.trim();
    const productId = formData.get("productId") as string;
    const reason = (formData.get("reason") as string)?.trim();

    if (!userEmail || !productId) {
      toast.error("Enter a customer email and choose a product");
      return;
    }

    setLoading(true);
    const result = await trackLoading(() =>
      grantEntitlementAction({ userEmail, productId, reason }),
    );
    if (result.success) {
      toast.success("Access granted");
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error?.message ?? "Failed to grant access");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4 text-primary" />
          Grant access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="entitlement-user-email">Customer email</Label>
            <Input
              id="entitlement-user-email"
              name="userEmail"
              type="email"
              required
              placeholder="customer@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entitlement-product">Product</Label>
            <select
              id="entitlement-product"
              name="productId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Choose a product…</option>
              {grantable.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                  {product.status === "ARCHIVED" ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entitlement-reason">Reason</Label>
            <Input
              id="entitlement-reason"
              name="reason"
              placeholder="Support comp, migration…"
            />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Granting..." : "Grant lifetime access"}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Grants are permanent one-time access. This does not create a
              charge or subscription.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function RevokeEntitlementButton({
  entitlementId,
  disabled,
}: {
  entitlementId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    setLoading(true);
    const result = await trackLoading(() =>
      revokeEntitlementAction(entitlementId, "Revoked by admin"),
    );
    if (result.success) {
      toast.success("Access revoked");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error?.message ?? "Failed to revoke access");
    }
    setLoading(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? "Already revoked" : "Revoke access"}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this access?</AlertDialogTitle>
            <AlertDialogDescription>
              The customer immediately loses access to the product&apos;s
              programs. You can grant it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Revoking..." : "Revoke access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
