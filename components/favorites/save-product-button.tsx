"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  toggleSavedProductAction,
  getSavedProductIdsAction,
} from "@/actions/favorite.actions";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveProductButtonProps = {
  productId: string;
  className?: string;
  size?: "sm" | "default";
};

export function SaveProductButton({
  productId,
  className,
  size = "default",
}: SaveProductButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getSavedProductIdsAction().then((result) => {
      if (cancelled) return;
      if (result.success && "savedIds" in result.data!) {
        setSaved((result.data as { savedIds: string[] }).savedIds.includes(productId));
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  function handleClick() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSavedProductAction(productId);
      if (!result.success) {
        setSaved(!next);
        if (result.error?.code === "UNAUTHORIZED") {
          router.push("/login?callbackUrl=/client/saved");
          return;
        }
        toast.error(result.error?.message ?? "Could not update saved items");
        return;
      }
      toast.success(next ? "Saved to your list" : "Removed from saved");
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={!hydrated || isPending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved programs" : "Save program"}
      className={cn(className)}
    >
      <Bookmark className={cn("size-4", saved && "fill-current text-primary")} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
