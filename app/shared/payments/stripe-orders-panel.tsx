"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  archivePaidOrdersAction,
  restorePaidOrdersAction,
} from "@/actions/order-admin.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export type StripePaidOrder = {
  id: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  paidAt: Date | null;
  user: { name: string; email: string };
  items: Array<{ id: string; productName: string; quantity: number }>;
};

type Props = {
  orders: StripePaidOrder[];
  archivedOrders?: StripePaidOrder[];
  archivedOrderCount?: number;
  activeOrderCount: number;
  activeRevenueCents: number;
  canManageArchive?: boolean;
};

export function StripeOrdersPanel({
  orders,
  archivedOrders = [],
  archivedOrderCount = archivedOrders.length,
  activeOrderCount,
  activeRevenueCents,
  canManageArchive = false,
}: Props) {
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const visibleOrders = showArchived ? archivedOrders : orders;
  const selectedCount = selectedIds.size;
  const allVisibleSelected = visibleOrders.length > 0
    && visibleOrders.every((order) => selectedIds.has(order.id));

  function setOrderSelected(orderId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function switchArchiveView(archived: boolean) {
    setSelectedIds(new Set());
    setShowArchived(archived);
  }

  async function applyArchiveChange() {
    setLoading(true);
    try {
      let changedCount = 0;
      if (showArchived) {
        const result = await restorePaidOrdersAction([...selectedIds]);
        if (!result.success) {
          toast.error(result.error?.message ?? "Could not restore selected orders");
          return;
        }
        changedCount = result.data?.restoredCount ?? 0;
      } else {
        const result = await archivePaidOrdersAction([...selectedIds]);
        if (!result.success) {
          toast.error(result.error?.message ?? "Could not archive selected orders");
          return;
        }
        changedCount = result.data?.archivedCount ?? 0;
      }

      toast.success(
        showArchived
          ? `Restored ${changedCount} order${changedCount === 1 ? "" : "s"}`
          : `Archived ${changedCount} order${changedCount === 1 ? "" : "s"}`,
      );
      setConfirmOpen(false);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Could not update orders. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function formatMoney(cents: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
      <CardHeader className="gap-5 border-b bg-primary/[0.03] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
              Successful Stripe orders
              <Badge className="gap-1 border-success/20 bg-success/10 text-success">
                <CheckCircle2 className="size-3" />
                Payments received
              </Badge>
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed one-time checkouts from Stripe and the Orders system.
            </p>
          </div>
        </div>
        <div className="flex gap-5 rounded-xl border bg-background/80 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Active orders
            </p>
            <p className="mt-0.5 text-xl font-bold">{activeOrderCount}</p>
          </div>
          <div className="border-l pl-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Collected
            </p>
            <p className="mt-0.5 text-xl font-bold text-success">
              {formatMoney(activeRevenueCents, "usd")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {(showArchived
          ? archivedOrderCount > archivedOrders.length
          : activeOrderCount > orders.length) && (
          <p className="text-xs text-muted-foreground">
            Showing the latest {visibleOrders.length} orders. Select and archive or
            restore up to 100 orders at a time.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Stripe orders">
            <Button
              type="button"
              size="sm"
              variant={showArchived ? "outline" : "default"}
              role="tab"
              aria-selected={!showArchived}
              onClick={() => switchArchiveView(false)}
            >
              Active
            </Button>
            {canManageArchive && (
              <Button
                type="button"
                size="sm"
                variant={showArchived ? "default" : "outline"}
                role="tab"
                aria-selected={showArchived}
                onClick={() => switchArchiveView(true)}
              >
                <Archive className="mr-1.5 size-4" />
                Archived ({archivedOrderCount})
              </Button>
            )}
          </div>

          {canManageArchive && (
            <Button
              type="button"
              size="sm"
              variant={showArchived ? "outline" : "destructive"}
              disabled={selectedCount === 0}
              onClick={() => setConfirmOpen(true)}
            >
              {showArchived
                ? <RotateCcw className="mr-2 size-4" />
                : <Archive className="mr-2 size-4" />}
              {showArchived ? "Restore" : "Archive"} selected ({selectedCount})
            </Button>
          )}
        </div>

        {visibleOrders.length === 0
          ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed bg-background/50 px-6 py-12 text-center">
              {showArchived
                ? <Archive className="mb-3 size-10 text-muted-foreground/40" />
                : <BadgeCheck className="mb-3 size-10 text-success/50" />}
              <p className="font-medium">
                {showArchived ? "No archived Stripe orders" : "No successful Stripe orders yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {showArchived
                  ? "Archived orders will be kept here and can be restored."
                  : "Paid checkouts will appear here after Stripe confirms payment."}
              </p>
            </div>
          )
          : (
            <div className="overflow-x-auto rounded-xl border bg-background/70">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr className="border-b">
                    {canManageArchive && (
                      <th className="w-12 px-4 py-3">
                        <Checkbox
                          aria-label={allVisibleSelected ? "Deselect all orders" : "Select all orders"}
                          checked={allVisibleSelected}
                          onCheckedChange={(checked) => {
                            setSelectedIds(
                              checked
                                ? new Set(visibleOrders.map((order) => order.id))
                                : new Set(),
                            );
                          }}
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 font-semibold">Customer & order</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Date paid</th>
                    {canManageArchive && (
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 transition-colors hover:bg-primary/[0.03]"
                    >
                      {canManageArchive && (
                        <td className="px-4 py-4">
                          <Checkbox
                            aria-label={`Select order for ${order.user.name}`}
                            checked={selectedIds.has(order.id)}
                            onCheckedChange={(checked) =>
                              setOrderSelected(order.id, Boolean(checked))}
                          />
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <p className="font-semibold">{order.user.name}</p>
                        <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.productName}{item.quantity > 1 ? ` × ${item.quantity}` : ""}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {formatMoney(order.totalCents, order.currency)}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">Stripe</Badge>
                          <Badge className="border-success/20 bg-success/10 text-[10px] text-success">
                            Paid
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(order.paidAt ?? order.createdAt)}
                      </td>
                      {canManageArchive && (
                        <td className="px-4 py-4 text-right">
                          <Button
                            type="button"
                            variant={showArchived ? "outline" : "secondary"}
                            size="sm"
                            aria-label={showArchived ? "Restore this order" : "Archive this order"}
                            title={showArchived ? "Restore order" : "Archive order"}
                            onClick={() => {
                              setSelectedIds(new Set([order.id]));
                              setConfirmOpen(true);
                            }}
                          >
                            {showArchived
                              ? <ArchiveRestore className="mr-2 size-4" />
                              : <Archive className="mr-2 size-4" />}
                            {showArchived ? "Restore" : "Archive"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {canManageArchive && (
          <p className="text-xs text-muted-foreground">
            Archiving only hides orders from the active list. Stripe payment history
            and customer access are preserved; archived orders can be restored.
          </p>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showArchived ? "Restore selected orders?" : "Archive selected orders?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showArchived
                ? `Restore ${selectedCount} order${selectedCount === 1 ? "" : "s"} to the active Payments list?`
                : `Archive ${selectedCount} order${selectedCount === 1 ? "" : "s"} from the active Payments list? This will not refund Stripe charges or remove customer access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading || selectedCount === 0}
              onClick={(event) => {
                event.preventDefault();
                void applyArchiveChange();
              }}
              className={!showArchived
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""}
            >
              {loading
                ? "Saving..."
                : showArchived
                ? "Restore orders"
                : "Archive orders"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
