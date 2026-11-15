/**
 * Authentic NomiTips coach photography (optimized WebP variants in public/media/coach).
 * Source: "nomitipscoaching's photoshots". All images show the same NomiTips coach.
 *
 * Variants per photo: -480 / -800 / -1600 (webp).
 * - `src` points at the 1600 variant so next/image can optimize any width.
 * - `poster` points at the 800 variant for direct use (video posters, etc.).
 *
 * `position` is the CSS object-position for cover crops. Sources are portrait
 * photos shown in landscape-ish containers (16/10 cards, 4/3 detail, 16/7
 * banners), so the vertical value keeps the coach's head/torso in frame at
 * every container aspect instead of showing the wall above her.
 */

const BASE = "/media/coach";

export type CoachImage = {
  /** 1600px variant — source for next/image (it generates its own srcset) */
  src: string;
  /** 800px variant — for direct <img>/video-poster use */
  poster: string;
  alt: string;
  /** CSS object-position focal point (e.g. "50% 20%") for object-cover crops */
  position?: string;
};

/** Build an image reference from a variant slug (e.g. "dumbbell-glute-growth"). */
export function coachImage(slug: string, alt: string, position?: string): CoachImage {
  return {
    src: `${BASE}/${slug}-1600.webp`,
    poster: `${BASE}/${slug}-800.webp`,
    alt,
    position,
  };
}

/** Catalog images keyed by product slug — DB imageUrl wins, this is the fallback. */
const PRODUCT_IMAGES: Record<string, CoachImage> = {
  "6-week-dumbbell-glute-growth": coachImage(
    "dumbbell-glute-growth",
    "NomiTips coach performing a dumbbell front squat",
    "50% 15%",
  ),
  "8-week-glute-growth-blueprint": coachImage(
    "glute-growth-blueprint",
    "NomiTips coach performing a single-arm dumbbell row on a bench",
    "50% 20%",
  ),
  "6-week-glutes-and-quads-builder": coachImage(
    "glutes-and-quads-builder",
    "NomiTips coach holding a deep squat position with a dumbbell",
    "50% 40%",
  ),
  "6-week-full-body-dumbbell-sculpt": coachImage(
    "full-body-dumbbell-sculpt",
    "NomiTips coach standing with a dumbbell in each hand",
    "50% 8%",
  ),
  "4-week-resistance-band-full-body-sculpt": coachImage(
    "resistance-band-full-body-sculpt",
    "NomiTips coach performing a banded leg extension on a mat",
    "50% 55%",
  ),
  "4-week-upper-body-dumbbell-sculpt": coachImage(
    "upper-body-dumbbell-sculpt",
    "NomiTips coach performing a standing dumbbell overhead press",
    "50% 5%",
  ),
  "nomi-8-week-signature-program": coachImage(
    "action-flex",
    "NomiTips coach flexing in the gym",
    "50% 12%",
  ),
  "21-day-booty-band-challenge": coachImage(
    "booty-band-challenge",
    "NomiTips coach performing a banded donkey kick on a mat",
    "50% 55%",
  ),
  "21-day-strong-abs-and-core-challenge": coachImage(
    "strong-abs-and-core",
    "NomiTips coach in a half-kneeling position with a resistance band",
    "50% 30%",
  ),
  "30-day-low-impact-cardio-burn": coachImage(
    "lifestyle-playful",
    "NomiTips coach training outdoors",
    "50% 22%",
  ),
  "14-day-tabata-and-cardio-challenge": coachImage(
    "action-squat-reach",
    "NomiTips coach in a squat reach with a dumbbell",
    "50% 50%",
  ),
  "30-day-glute-growth-challenge": coachImage(
    "action-glute-kickback",
    "NomiTips coach performing a glute kickback on a bench",
    "50% 55%",
  ),
  "lower-body-bundle": coachImage(
    "action-band-lunge",
    "NomiTips coach performing a kneeling resistance band lunge",
    "50% 25%",
  ),
  "sculpt-and-sweat-bundle": coachImage(
    "lifestyle-walk-1",
    "NomiTips coach heading to training with her gym bag",
    "50% 16%",
  ),
  "complete-nomitips-bundle": coachImage(
    "lifestyle-bag-portrait",
    "NomiTips coach in her training kit with a gym bag",
    "50% 18%",
  ),
};

/** Normalize a stored DB imageUrl (any width variant) into a CoachImage. */
function fromStoredUrl(url: string, alt: string, position?: string): CoachImage {
  const match = url.match(/^(.*)-(?:480|800|1600)\.webp$/);
  if (match) {
    return { src: `${match[1]}-1600.webp`, poster: `${match[1]}-800.webp`, alt, position };
  }
  return { src: url, poster: url, alt, position };
}

/**
 * Resolve a product's cover image: stored DB imageUrl (if set) wins,
 * otherwise the per-slug catalogue fallback.
 */
export function getProductImage(product: {
  slug: string;
  imageUrl?: string | null;
}): CoachImage | null {
  const fallback = PRODUCT_IMAGES[product.slug] ?? null;
  if (product.imageUrl) {
    return fromStoredUrl(
      product.imageUrl,
      fallback?.alt ?? `Cover image for ${product.slug}`,
      fallback?.position,
    );
  }
  return fallback;
}

/** Coach photography used in marketing sections (homepage, promo areas). */
export const MARKETING_IMAGES = {
  heroPoster: coachImage(
    "lifestyle-smile",
    "NomiTips coach smiling after a training session",
  ),
  heroPreview: coachImage(
    "action-squat-reach-2",
    "NomiTips coach performing a squat reach with a dumbbell",
  ),
  coachWelcome: coachImage(
    "coach-portrait-3",
    "NomiTips coach in the gym",
    "50% 14%",
  ),
  coachAvatar: coachImage(
    "coach-portrait-1",
    "NomiTips coach",
    "50% 0%",
  ),
} as const;
