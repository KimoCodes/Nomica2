"use client";

import { forwardRef } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoadingButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  loadingText?: string;
};

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, disabled, className, children, variant, size, ...props }, ref) => {
    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        disabled={loading || disabled}
        aria-busy={loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && <Spinner size="xs" className="shrink-0" />}
        {loading && loadingText ? loadingText : children}
      </ButtonPrimitive>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
