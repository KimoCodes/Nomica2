"use client";

const CART_KEY = "nomitips-cart-v1";
const CART_EVENT = "nomitips-cart-updated";

export function readCartIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(parsed.filter((id): id is string => typeof id === "string")),
    ].slice(0, 20);
  } catch {
    return [];
  }
}

export function writeCartIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)].slice(0, 20);
  localStorage.setItem(CART_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event(CART_EVENT));
}

export const cartUpdatedEvent = CART_EVENT;
