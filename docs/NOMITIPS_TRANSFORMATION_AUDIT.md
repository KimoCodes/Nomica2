# NomiTips platform transformation audit and plan

Audit performed against the repository on 2026-10-15. This is a static code and schema review. No production database was queried, and no migration was run.

## Current architecture

- **Frontend and server:** Next.js 16.2 App Router, React 19, TypeScript, server components, server actions, and route handlers. A custom Node server hosts Socket.IO.
- **Database:** PostgreSQL hosted on Neon, accessed through Prisma 7 and `@prisma/adapter-neon`. Migrations are under `prisma/migrations`; the repository also has a separate Supabase SQL migration directory, which is not the Prisma source of truth.
- **Authentication:** NextAuth v5 with Prisma adapter, credentials/password flows, email verification, reset tokens, and role-based sessions (`ADMIN`, `COACH`, `CLIENT`). Registration defaults to `CLIENT` and does not collect payment details.
- **Authorization:** `requireRole`/`requireAuth` are used by many actions and pages; `proxy.ts` provides route-level role gating. A subscription guard and feature gates additionally control client features. These layers do not replace resource-level ownership checks.
- **Payments:** Stripe Checkout and signed webhooks. One-time product checkout already exists alongside monthly/annual subscription checkout, manual payment requests, subscription payments, and free trials.
- **Catalog/content:** `Product` supports programs, challenges, and bundles. `BundleItem` references products; `Program → ProgramWeek → ProgramDay → ProgramExercise → Exercise` is the existing content hierarchy. Programs are also assignable to coach clients.
- **Media:** Cloudinary is used for uploaded media; public program videos and media URLs also exist. No private, entitlement-gated video delivery flow was found in the reviewed purchase paths.
- **Admin:** Separate admin areas exist for products, programs, users, payments, subscriptions, content, and analytics. Product CRUD exists; product publishing is represented by `isActive` rather than explicit draft/published/archived states.
- **Deployment and CI:** Docker, Docker Compose, PM2 configuration, GitHub Actions, standalone Next output, and a production data audit script are present. CI runs TypeScript, ESLint, Vitest, and a build. There are no browser E2E tests in the repository.
- **Testing:** Vitest covers selected auth/onboarding/fitness services and utilities. Purchase, bundle pricing, Stripe checkout/webhook, entitlement, and protected-program flows have no focused tests.

## Current business and access behavior

- The public catalog at `/programs` and `/bundles` reads active products from the database and exposes prices. Product details link to checkout.
- `createProductCheckout` accepts one product ID, checks for a completed direct purchase, reads the database price, and creates Stripe Checkout in `payment` mode. It does not create an order before redirecting and there is no multi-item cart/order abstraction.
- The Stripe webhook handles one-time purchases by upserting a completed `Purchase` from session metadata. It does not verify that the checkout session is paid, that amount/currency match the catalog/order, or that the referenced user/product are valid and active. It does not grant a durable explicit entitlement. The event ledger is unique by Stripe event ID, but event claiming and processing are not atomic; concurrent retries can race.
- `hasEntitlement` currently grants access through any active subscription, any active free trial, direct completed purchase, or a completed bundle purchase. Consequently a subscription or free trial grants all catalog programs, contrary to the target model.
- The entire client application is wrapped in `SubscriptionGuard`, and the dashboard prompts non-subscribers to choose a plan. Registration itself is already free, but onboarding and the client area do not yet behave like a free account plus personal library.
- Coach-assigned programs and workouts are a separate existing workflow. Workout pages check a user's active `ClientProgram` assignment and their own `ClientProfile`; that flow should remain available to coaching customers while purchased catalog programs gain a separate entitlement check.
- Subscription checkout, management, manual payment approval, free trials, subscription notifications, coach subscription pages, and subscription analytics remain active. Subscription tables contain financial/provider identifiers and must remain intact during transition.
- `Product` has useful catalog fields but lacks equipment requirements, explicit publication state, and a distinct preview asset. Bundle pricing is stored as a product price, but no shared incremental-ownership/bundle savings calculator or cart is present.
- The full product lookup includes nested weeks, days, exercises, and media relationships. Public product detail must be checked carefully to ensure this response does not expose full protected workout instructions or video URLs.

## Important legacy dependencies

1. `Subscription`, `Payment`, `BillingEvent`, and `PaymentRequest` are linked to active routes, admin/coach/client pages, notifications, dashboard queries, and feature gates.
2. `FreeTrial` is an additional all-access grant path and is used in client layouts, dashboard messaging, and entitlement checks.
3. `ClientProgram` is both a coach-assigned training workflow and the anchor for workout completion/progress. It cannot be repurposed as purchase ownership without breaking coach workflows.
4. `Purchase` is a one-product transaction record, not a multi-line order. Existing purchases and Stripe identifiers must remain auditable.
5. `lib/env.ts` currently requires monthly/annual Stripe price IDs at startup, and `.env.example`/README describe recurring plans as required configuration.
6. Subscription copy appears across the pricing page, client subscription/payments pages, dashboard, actions, services, notification/email templates, coach/admin routes, and tests. Search-and-replace would break historical/admin functionality and is not a safe migration strategy.

## Risks and audit findings

- **Critical authorization/model mismatch:** Subscription and trial grants still unlock every product. All purchase access must move to explicit, server-checked product entitlements.
- **Critical payment validation gaps:** One-time webhook completion trusts metadata and does not validate payment status, amount, currency, or the expected user/product relationship.
- **Critical content exposure risk:** Product-detail data access retrieves complete program structure; public preview and protected content need separate queries/serializers and checks at every server boundary.
- **Concurrency risk:** Stripe event deduplication checks then processes without a transactional claim/lock; entitlement creation must be idempotent under concurrent deliveries.
- **No historical customer policy:** No live records were inspected. The repository contains an `audit-production-data.ts` script, but its output has not been run or reviewed. We cannot responsibly infer which existing customers should receive permanent product rights or when recurring billing should stop.
- **Schema migration risk:** Current `SubscriptionPlan` values and `PaymentRequest.plan` are historical financial/business records. Dropping or rewriting them would destroy meaning and can fail on live rows. Keep them and add a forward-only, additive migration until retention and migration policy are approved.
- **Storage risk:** Cloudinary usage needs an inventory by visibility and content type. Public assets must not be treated as protected merely because their links are hidden in the UI.
- **Implementation scale:** The current system includes coaching, nutrition, messaging, and analytics alongside the catalog. Catalog ownership can be introduced without deleting those capabilities; their commercial/access policy needs explicit treatment.

## Authorization matrix (target)

| Resource | Guest | Free account | Purchased / entitled | Admin |
| --- | --- | --- | --- | --- |
| Public catalog, prices, details, quiz | Read | Read | Read | Manage |
| Explicit preview media/content | Read | Read | Read | Manage |
| Full purchased program/workouts/resources | Deny | Deny | Own entitled product only | Manage |
| Orders and library | Deny | Own empty/library state | Own orders and entitlements | Search/manage |
| Progress | Deny | Own general profile data | Own progress for entitled programs | Support access with audit |
| Coach-assigned client program | Deny | Own assignment only when assigned | Own assignment only when assigned | Existing role policy |
| Another user's data | Deny | Deny | Deny | Existing audited admin policy |

## Implementation plan

1. **Architecture and migration baseline:** Keep Prisma/Neon, NextAuth, Stripe, Cloudinary, and the existing server-action/service patterns. Record a static baseline, inspect production data through a redacted report before migration, and use an additive Prisma migration on an isolated Neon branch. Do not reset or migrate production from this work session.
2. **Data model:** Add first-class `Order`, `OrderItem`, and `Entitlement` records. Snapshot item name/price/currency on orders. Entitlements point to a specific product and source order item, include grant/revoke metadata and a unique idempotency key, and are created transactionally. Keep `Purchase` as legacy financial history until a verified backfill/report proves how to map it.
3. **Authentication:** Retain free `CLIENT` registration and current session security. Remove subscription/payment prerequisites from account and catalog browsing. Preserve email verification and password recovery.
4. **Authorization:** Replace broad subscription/trial content grants with entitlement checks for catalog programs. Add explicit product-to-workout ownership checks in server queries/actions. Keep coach-assigned access as a separate, explicit assignment path. Never rely on `proxy.ts` or client UI alone.
5. **Payments:** Keep Stripe Checkout in one-time `payment` mode for catalog orders. Server creates order and calculates product/bundle price, rejects inactive/owned/invalid selections, and sends only its authoritative line items. Verify signed webhook, paid state, amount/currency and order linkage; atomically claim event, transition order, and create entitlements. Success redirect only displays current server order state.
6. **Catalog and previews:** Extend the database model for equipment, preview media, and `DRAFT/PUBLISHED/ARCHIVED`; retain existing workout structures. Public queries return only published metadata and explicitly approved preview content. Admin product/content screens manage publication and preview classification.
7. **Cart, bundles, and ownership:** Add a multi-product cart and shared server pricing logic. Bundle recommendations expose the exact included products and calculated savings; do not replace cart items. Exclude already-owned items from charges only under explicit bundle pricing rules. Bundle purchases create entitlements for each included program from a snapshot of bundle contents.
8. **Client library and progress:** Add `/client/programs` (or equivalent) as a personal library and make dashboard answer what the user owns and what to do next. Reuse `ProgramWeek`, `ProgramDay`, `WorkoutCompletion`, and `WorkoutSetLog`; key purchased catalog access to entitlement while retaining assigned-program progress.
9. **Admin and operations:** Add order/customer entitlement views and explicit status management. Archive products instead of deleting them. Preserve payment records and make refunds/revocations auditable.
10. **Legacy transition:** First produce a redacted report of active/historical subscriptions, trials, products, completed purchases, and assignments. Keep legacy tables and webhook support during the transition. Decide with business owners whether billing is canceled, what active/historical subscribers receive, and whether manual approvals/trials continue; implement a reviewed idempotent backfill only after that mapping is agreed.
11. **Verification:** Add unit tests for pricing, bundle expansion, entitlement checks/idempotency, and order state transitions; integration tests for authenticated checkout/webhook and protected content; E2E journeys for individual purchase, bundle, and unauthorized access. Run existing tests, typecheck, lint, build, and a migration diff against a disposable/isolated database branch.
12. **Deployment and rollback:** Take/verify database backup or Neon restore point, deploy additive schema first, then compatible application code, then run a dry-run and reviewed backfill. Keep old tables and compatibility reads during rollout. Roll back application code without dropping additive tables; do not reverse a populated backfill destructively.

## Migration decision still required

The business must choose how existing subscribers and manually approved subscribers are treated when recurring billing ends. Until that decision and a redacted production-data report exist, the safe default is to preserve all legacy subscription/payment rows and avoid changing or canceling provider-side subscriptions. This is a deployment gate, not a blocker for additive catalog and entitlement work.

## Work completed in this implementation pass

- Added additive Prisma migrations for orders, immutable order-item pricing/bundle snapshots, payment records, explicit product entitlements, and (2026-10-16) Product publication states (`ProductStatus { DRAFT, PUBLISHED, ARCHIVED }`, default DRAFT with backfill), `equipment String[]`, and `previewVideoUrl`, dropping unused `isActive`. Existing purchase, subscription, payment, and trial tables are retained.
- Added one-time server-priced order checkout, bundle expansion helpers, Stripe paid-state/amount/currency verification, idempotent entitlement creation, refund status handling, and an authenticated owner-only order endpoint. Production DB audited: 0 legacy subscriptions/purchases; migration applied and seed run (14 products, 22 programs, 8 users on real-email Neon DB).
- Split public product detail metadata from protected program content; program/bundle detail pages return 404 unless PUBLISHED (or owned/ADMIN). Added an entitlement-checked client program library and order history, plus entitlement-aware workout assignment/completion checks. Removed subscription purchase marketing, new-plan checkout entry points, manual plan approvals, the customer billing portal, the subscription FeatureGate, `FEATURE_GATING`, and `hasActiveSubscription`-style dead code; register is free; login honors `callbackUrl`; CLIENT_NAV Subscription entry removed.
- Added a browser-persisted multi-product cart with server-computed prices, ownership/bundle-overlap checks, and a server-side bundle savings suggestion (`findBundleSuggestion`: ≥2 covered items, cheaper than covered total, no owned children, skipped when cart has a bundle). Middleware (`proxy.ts`) exposes `/cart`, `/checkout`, and `/api/catalog` to guests (verified: all public pages 200, guest cart API 200).
- Publication/equipment/preview (§52 gates): product admin CRUD with status select, equipment tags, preview video URL, publish toggle (`setProductStatusAction`); catalog queries default to PUBLISHED; program detail page shows equipment chips and gated `previewVideoUrl` preview; program→product sync publishes with PUBLISHED; seed includes per-product equipment.
- Admin order/entitlement management: `markOrderRefundedAction` (PAID/PARTIALLY_REFUNDED→REFUNDED, revokes entitlements), idempotent `grantEntitlementAction` (reactivates revoked, creates ClientProgram), `revokeEntitlementAction`; refund button on orders table; new `/admin/entitlements` page with grant/revoke; Entitlements nav entry.
- Protected video delivery: `/api/media/videos/[exerciseId]` (401 guest; CLIENT needs ownership OR active ClientProgram — same rule as library; COACH/ADMIN pass; 307 to signed URL, `Cache-Control: private, no-store`); `video-delivery.service` signs own-cloud URLs (300s TTL), passes through external links; workout/library serializers emit proxy URLs.
- Entitlement service slimmed to catalog-only access (`hasProductEntitlement`, `getOwnedCatalogProductIds`); dead `hasEntitlement`/`getEntitledProductIds`/`hasActiveSubscription` removed.
- Copy sweep: no customer-facing recurring-billing or "cancel anytime" language; refund policy and terms refactored around one-time purchases with legacy-subscription read-only notes.
- Tests: new journey suites (Journeys A–D: catalog gating, checkout pricing, owned/bundle rules), `order-admin.actions` tests, `video-delivery.service` tests. Full suite **281/281 passing across 34 files**.
- Quality gates all green in the working Node environment: `tsc --noEmit` exit 0; `eslint` **0 errors** (139 pre-existing warnings: unused-vars, no-img-element, alt-text, exhaustive-deps — script does not use `--max-warnings`); `next build` succeeds; vitest 281/281; live smoke of all public routes 200 and guest cart bundle suggestion verified (Glute Builder + Toned Legs → Lower-Body Bundle, $4.99 savings).

## Remaining implementation and release gates

- Business decisions to confirm before launch (documented, not blockers): nutrition plans and client–coach messaging are free; exercise library video content is entitlement-gated with preview; 0 legacy subscriptions on this database so no customer transition is needed here (a production deploy with legacy subscribers must still honor the read-only legacy paths).
- Historical `Purchase` records are preserved but not merged into the client order-history UI or backfilled into entitlements (not applicable on this DB; needed if deployed where historical purchases exist).
- Admin order search/pagination and automated grant/revoke audit-log entries are not implemented (manual grant/revoke exists without a dedicated audit trail UI).
- Legacy free-trial and manual-subscription code paths remain for historical compatibility (read-only) and can be retired once no deployed environment has legacy rows.
- Before a production release with real subscribers: apply migrations on an isolated Neon branch, re-run the redacted production data audit, and execute the agreed legacy-customer transition decision.
