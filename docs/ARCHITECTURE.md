# NOMICA Platform — Architecture Decisions

_Last updated: 2026-08-04 (M0 consolidation)._

## Source of truth

- **`NOMICA_Fitness_Catalog.pdf` is canonical for all fitness content and pricing.**
  - Signature Collection (one-time purchase, lifetime access):
    - Glute Builder — 8 wk, 5 d/wk — $34.99
    - Hourglass Sculpt — 8 wk, 5 d/wk — $34.99
    - Toned Legs — 6 wk, 5 d/wk — $24.99
    - Full-Body Sculpt — 8 wk, 5 d/wk — $34.99
    - Beginner Gym Confidence — 6 wk, 5 d/wk — $24.99
    - Strong & Toned — 8 wk, 5 d/wk — $39.99
  - Focused Series (challenges): Cardio Burn (21 d, $12.99), Core & Abs (21 d, $12.99),
    Glute Growth (21 d, $12.99), Quad Sculpt (21 d, $12.99), StairMaster (30 d, $14.99).
    Focus categories: SWEAT (Cardio Burn), SCULPT (Core/Glutes/Quads), CLIMB (StairMaster).
  - Bundles: Lower-Body $54.99, Sculpt & Sweat $59.99, Complete NOMICA $119.99.
  - All-Access membership: **$14.99/mo, $149.99/yr** (two months free).
- Where `NOMICA_BLUEPRINT.md` or `constants/*` conflict with the PDF (e.g. Sculpt Club
  $39/$79, STARTER/PREMIUM/ELITE plans), **the PDF wins**. Blueprint remains useful for
  page structure/copy direction only.

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
