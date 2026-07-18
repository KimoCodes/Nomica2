"use client";

import { useEffect, useRef, useState } from "react";

type UseDebounceOptions<T> = {
  delay?: number;
  onSearch?: (value: T) => void;
};

export function useDebounce<T>(
  initialValue: T,
  options?: UseDebounceOptions<T>,
) {
  const { delay = 300, onSearch } = options ?? {};
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      onSearch?.(value);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay, onSearch]);

  return { value, setValue, debouncedValue, isSearching: value !== debouncedValue };
}
