"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  cartUpdatedEvent,
  readCartIds,
  writeCartIds,
} from "@/components/cart/cart-storage";
import Link from "next/link";

export function CartProductButton({
  productId,
  owned = false,
  disabledMessage,
}: {
  productId: string;
  owned?: boolean;
  disabledMessage?: string;
}) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const update = () => setInCart(readCartIds().includes(productId));
    update();
    window.addEventListener(cartUpdatedEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cartUpdatedEvent, update);
      window.removeEventListener("storage", update);
    };
  }, [productId]);

  function addToCart() {
    const ids = readCartIds();
    if (ids.includes(productId)) {
      setInCart(true);
      return;
    }
    if (ids.length >= 20) return;
    writeCartIds([...ids, productId]);
    setInCart(true);
  }

  if (owned) {
    return (
      <Link
        href="/client/programs"
        className={cn(buttonVariants(), "w-full justify-center opacity-90")}
      >
        <Check className="mr-2 size-4" />Owned — My Programs
      </Link>
    );
  }
  if (disabledMessage) {
    return (
      <div>
        <button
          type="button"
          disabled
          className={cn(
            buttonVariants(),
            "w-full cursor-not-allowed opacity-60",
          )}
        >
          Add to cart
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {disabledMessage}
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={inCart}
      className={cn(buttonVariants(), "w-full")}
    >
      {inCart
        ? <Check className="mr-2 size-4" />
        : <ShoppingCart className="mr-2 size-4" />}
      {inCart ? "Added to cart" : "Add to cart"}
    </button>
  );
}
