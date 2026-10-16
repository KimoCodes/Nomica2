"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cartUpdatedEvent, readCartIds } from "@/components/cart/cart-storage";

export function CartCount({ className }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCartIds().length);
    update();
    window.addEventListener(cartUpdatedEvent, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cartUpdatedEvent, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        className,
      )}
      aria-label={`Shopping cart, ${count} items`}
    >
      <ShoppingBag className="mr-1.5 size-4" />
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
