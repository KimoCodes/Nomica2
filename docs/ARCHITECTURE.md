# NomiTips Platform — Architecture Decisions

_Last updated: 2026-08-04 (M0 consolidation)._

## Source of truth

- **`clean_workout_programs_catalog.pdf` is canonical for all fitness content and pricing.**
  - Programs (one-time purchase, lifetime access):
    - 6-Week Dumbbell Glute Growth — 6 wk, 5 d/wk — $19.99
    - 8-Week Glute Growth Blueprint — 8 wk, 5 d/wk — $29.99 (most popular)
    - 6-Week Glutes & Quads Builder — 6 wk, 5 d/wk — $19.99
    - 6-Week Full Body Dumbbell Sculpt — 6 wk, 5 d/wk — $19.99
    - 4-Week Resistance Band Full Body Sculpt — 4 wk, 5 d/wk — $14.99
    - 4-Week Upper Body Dumbbell Sculpt — 4 wk, 4 d/wk — $14.99
  - Challenges: 21-Day Booty Band (21 d, $9.99), 21-Day Strong Abs & Core (21 d, $9.99),
    30-Day Low-Impact Cardio Burn (30 d, $12.99), 14-Day Tabata & Cardio (14 d, $9.99).
    Focus categories: SCULPT (Booty Band, Abs & Core), SWEAT (Cardio Burn, Tabata).
  - Bundles: Lower-Body $34.99, Sculpt & Sweat $54.99, Complete NomiTips $99.99 (39% off).
  - All-Access membership: **$14.99/mo, $149.99/yr** (two months free).
- Where `NOMICA_BLUEPRINT.md` or `constants/*` conflict with the PDF, **the PDF wins**.
  Blueprint remains useful for page structure/copy direction only. The superseded
  `NOMICA_Fitness_Catalog.pdf` (Glute Builder/Hourglass/etc.) rows were deleted from the DB.

## Reference model (solin.stream)

Functionality to recreate (not branding): creator storefront landing (hero, stats,
social proof), program cards with price + Learn More/Buy, program detail pages
(guarantee, "Your access includes", highlights, training split, reviews, sticky buy CTA),
Stripe checkout, lifetime access on one-time purchase, reviews feed, membership tier,
client app with program calendar/day player and community/chat.

## Domain model decisions

1. **Catalog is database-driven** via a `Product` model (kind: `PROGRAM | CHALLENGE | BUNDLE`),
   seeded from the PDF. Marketing constants (`constants/products.ts`, `bundles.ts`, `club.ts`)
   are legacy and get replaced page-by-page (M5) — do not extend them.
2. **Product ↔ Program link**: a purchasable `Product` of kind PROGRAM/CHALLENGE points to a
   `Program` (the actual weeks/days/exercises content). Bundles reference child products
   through `BundleItem`.
3. **Entitlements are derived, not stored**: access to a program = completed `Purchase` of its
   product, OR purchase of a bundle containing it, OR an active All-Access subscription.
   Single source: `server/services/entitlement.service.ts`.
4. **Membership**: `SubscriptionPlan` becomes `ALL_ACCESS_MONTHLY | ALL_ACCESS_ANNUAL`
   ($14.99 / $149.99 per the PDF). Old STARTER/PREMIUM/ELITE rows migrate to MONTHLY.
5. **Payments**: Stripe Checkout + webhooks behind a provider interface
   (`server/payments/`). When `STRIPE_SECRET_KEY` is unset, a clearly-labeled dev
   provider simulates the redirect flow so local dev works end-to-end. The existing
   `simulatePaymentAction` self-activation hole is removed in M6.
6. **Reviews**: `Review` model (user × product, rating + body, verified-purchase flag) to
   power Solin-style social proof from real data instead of hardcoded testimonials.

## Layering conventions (keep / enforce)

- `actions/*.actions.ts` → auth check (`requireAuth`/`requireRole`) → Zod validation
  (`server/validators/*`) → service call (`server/services/*`) → `ApiResponse` envelope.
  Services own **ownership checks** and throw string-coded errors (`NOT_FOUND`, `FORBIDDEN`).
- Shared `parseFormData` lives in `server/utils/form-data.ts` (dedupe the 6 copies).
- Post-auth redirect logic lives only in `constants/routes.ts`.
- ID convention fix: `Exercise.coachId` stores a CoachProfile id while
  `ClientProfile.coachId` stores a User id — document at every use site; unify when touched.

## Known debt register (fix in the milestone noted)

- M1–M8: DONE (demo content, brand audit, dead code, UI polish, security/SEO, a11y/loading, middleware fix, error boundaries)
- M8+: Subscription access flow DONE (FeatureGate status check, payments exemption, dashboard CTA, shared ACTIVE_STATUSES)
- M9: Production deployment readiness — DB migrations, env validation, structured logging, error tracking, README, Docker (see TODO.md)
- M10: wire the dead `Notification` model into UI + socket events; fix socket room-leave and
  typing-event membership checks.
- M11: media API ownership/visibility holes (`app/api/media/*`), Cloudinary publicId storage,
  N+1 unread counts, dark-mode ThemeProvider decision.

## Next.js 16 notes

- `proxy.ts` replaces `middleware.ts` (already correct in repo).
- Consult `node_modules/next/dist/docs/` before using unfamiliar APIs.
