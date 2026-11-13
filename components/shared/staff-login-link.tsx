"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StaffLoginLink({ className }: { className?: string }) {
  return (
    <Link
      href="/staff-login"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)}
    >
      Admin login
    </Link>
  );
}
