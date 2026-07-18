"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import type { ApiResponse } from "@/types";

type UseActionOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
};

export function useActionLoading<T = unknown>(
  action: (formData: FormData) => Promise<ApiResponse<T>>,
  options?: UseActionOptions<T>,
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const lastCallRef = useRef(0);

  const execute = useCallback(
    (formData: FormData) => {
      const callId = Date.now();
      lastCallRef.current = callId;

      setError(null);
      setSuccess(false);

      startTransition(async () => {
        try {
          const result = await action(formData);

          if (callId !== lastCallRef.current) return;

          if (result.success) {
            setSuccess(true);
            options?.onSuccess?.(result.data as T);
          } else {
            const message = result.error?.message ?? "Something went wrong";
            setError(message);
            options?.onError?.(message);
          }
        } catch {
          if (callId !== lastCallRef.current) return;
          const message = "An unexpected error occurred";
          setError(message);
          options?.onError?.(message);
        }
      });
    },
    [action, options],
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { isPending, error, success, execute, reset };
}
