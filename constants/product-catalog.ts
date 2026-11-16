export const STRIPE_PAYMENT_TEST_PRODUCT_SLUG = "stripe-payment-test";

/** ProductFocus enum → display label (SWEAT → "Sweat"). Null/undefined passthrough. */
export function formatFocusLabel(focus: string | null | undefined): string | null {
  if (!focus) return null;
  return focus.charAt(0) + focus.slice(1).toLowerCase();
}

/** Difficulty enum → display label (INTERMEDIATE → "Intermediate"). */
export function formatDifficultyLabel(
  difficulty: string | null | undefined,
): string | null {
  if (!difficulty) return null;
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
}
