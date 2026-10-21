# NomiTips — New Version Implementation Record

**Project:** NomiTips fitness platform (`/Applications/XAMPP/xamppfiles/htdocs/Nomica2`)
**Stack:** Next.js 16 (App Router) · React 19 · Prisma 7 + Neon Postgres · NextAuth v5 · Stripe · Cloudinary · Resend · Tailwind/shadcn · Vitest
**Repo:** github.com/KimoCodes/Nomica2 · **Prod:** nomitips.com (VPS, nginx → Node via systemd)
**Period:** October 2026 (core transformation → feature expansion → production hardening)

---

## 1. Business Model Transformation

**Before:** Subscription platform ("All Access" monthly/annual plans, Sculpt Club membership, pricing pages).
**After:** Free accounts + one-time-purchase catalog (programs, challenges, bundles). No customer-facing recurring billing, no dark patterns, no guaranteed fitness claims.

### Core rules established
- **Entitlements are the single source of access truth** (`ProductEntitlement` rows grant program access; nothing trusts client-side ownership or price logic).
- **Permanent purchases** — no expiry, no renewals.
- **Nutrition and messaging tools remain free** for all signed-in users; exercise library content is entitlement-gated with free previews.
- **Publication states** on products: `DRAFT → PUBLISHED / UNLISTED / ARCHIVED`; public catalog shows only `PUBLISHED`.
- **0 legacy subscriptions existed** on the production DB, so legacy subscription UI was reduced to conditional legacy-only sections (e.g. payments page).

### Key migrations / schema
- `ProductStatus`, `ProductKind` (PROGRAM / CHALLENGE / BUNDLE), `ProductFocus`, `equipment`, `previewVideoUrl`.
- `ProductEntitlement` (userId + productId, granted on paid order).
- `Order` / `OrderItem` one-time purchase model with Stripe Checkout Sessions (not subscriptions).
- `Favorite` (userId, type PROGRAM, targetId) with unique `userId_type_targetId`.
- `Review` (userId, productId, rating, isVerified, isPublished) with unique `userId_productId`.
- `User.referralCode` (unique) + `User.referredById` (self-relation `UserReferrals`, `onDelete: SetNull`, indexed) — migration `20261016120000_add_user_referral_fields`.

---

## 2. Core Implementation Work

### 2.1 Auth & registration
- Free email/password registration for CLIENT and COACH roles (no payment step).
- Role preserved from form; admin notification email on signup.
- Referral capture: `registerUser` reads `?ref=` (via hidden FormData field appended by `components/forms/register-form.tsx`), resolves through `resolveReferralCode`, stores `referredById` on create.
- Rate-limited registration (`enforceAuthRateLimit`).

### 2.2 Checkout & orders
- Guest cart in `localStorage` (`components/cart/cart-storage.ts`: `readCartIds`/`writeCartIds`).
- `createOrderCheckout` (server action) → Stripe Checkout Session (one-time payment) → webhook `checkout.session.completed` verifies, creates entitlements in a transaction, marks order PAID.
- Order confirmation email (`sendOrderConfirmationEmail`) fired fire-and-forget from `handleOrderCheckoutPaid` after transaction commit.
- Order status API `app/api/orders/[id]/route.ts`: session-scoped, `Cache-Control: private, no-store`, extended with `crossSellBundles` for PAID orders.
- Checkout success page polls order status (`app/checkout/success/CheckoutSuccessContent.tsx`) with legacy-subscription return handling; cancel page (`/checkout/cancel`).

### 2.3 Catalog & bundles
- Public pages: `/programs` (listing with kind tabs + search), `/programs/[slug]`, `/bundles`, `/bundles/[slug]`.
- Bundle pricing: full price only; partially-owned bundles **disable purchase** with honest copy ("Incremental bundle pricing is not available yet") — no dead-end checkout.
- `getPublishedBundlesContaining(productId)` → "Also in {Bundle}" hint on program detail pages.
- Quiz (`/quiz`, `constants/quiz.ts`): 5-step goal/experience/schedule/equipment/budget quiz; **all 108 answer combinations verified to resolve to real published products at DB-accurate prices** (dead links to `glute-bundle`, `beginner-bundle`, `beginner-gym-guide`, `12-week-glute-sculpt`, and the dead "Sculpt Pro Membership" were removed; budget step reframed as "Biggest savings" → Complete NomiTips Bundle).

### 2.4 Entitlement-gated client area
- `app/client/(app)/…` dashboard: Dashboard, My Programs, Orders, Saved, Referrals, Workouts, My Plan, Nutrition, Habits, Goals, Progress, Payments (legacy-only), Messages, Timers.
- Owned program view `app/client/(app)/programs/[slug]` loads full workout structure only after entitlement check (`getProtectedProductProgram`).
- Protected signed video delivery `/api/media/videos/[exerciseId]` (entitlement-checked, signed URLs) — no raw Cloudinary links in client HTML.

### 2.5 Admin tooling
- Product CRUD + publication states.
- Orders admin: refund (full/partial) → `PARTIALLY_REFUNDED`/`REFUNDED` + entitlement revocation; manual grant/revoke entitlements (`/admin/entitlements`).
- Content admin: website media library, page-content CMS (optional overrides; public pages have hardcoded fallbacks so empty CMS is safe), branding assets.
- CMS presets/labels cleaned of dead targets (`sculpt_club`, `pricing`, `club`).

### 2.6 Copy sweep (no stale subscription language)
- Terms, refund policy, homepage, billing/payments page, dashboard upsell, emails — all rewritten for one-time purchases.
- Homepage FAQ additions: "Is this a subscription?" / "Do I keep access after I buy?".
- Dead subscription emails (`sendSubscriptionConfirmationEmail`, `sendSubscriptionCancelledEmail`) deleted; legacy Stripe subscription-sync cancellation emails now link to `/programs`.

---

## 3. Feature Expansion (post-transformation)

### 3.1 Referral program
- **Schema:** `User.referralCode` (unique), `User.referredById` → self-relation, index; migration applied to prod Neon.
- **Service** `server/services/referral.service.ts` (DB-backed, replaced in-memory Map):
  - `getOrCreateReferralCode` — 8-char codes from alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, collision-checked with retry on unique-constraint race.
  - `resolveReferralCode` — normalize/uppercase, resolve to referrer id.
  - `getReferralStats` — completed = referred user has ≥1 PAID/PARTIALLY_REFUNDED order; pending = signed-up, no purchase.
  - `buildReferralLink` — `{AUTH_URL}?ref=CODE`.
- **UI:** `/client/referrals` dashboard (code, copy-link, stats: joined / first purchases / exploring, how-it-works), nav entry with Gift icon.
- **Attribution:** register form appends `?ref=` from URL; server resolves and persists at user creation. No self-referral possible (new user has no code).

### 3.2 Saved items (wishlist)
- Actions `actions/favorite.actions.ts`: `toggleSavedProductAction` (auth + CLIENT role, PUBLISHED/ARCHIVED products only, user-scoped), `getSavedProductIdsAction`, `listSavedProductsAction` (preserves saved order, `priceLabel`).
- `components/favorites/save-product-button.tsx` — optimistic toggle, `aria-pressed`, login redirect on UNAUTHORIZED.
- `/client/saved` page: skeletons, empty state, remove, move-to-cart (localStorage cart + redirect).
- Save buttons wired into program + bundle detail pages.

### 3.3 Review prompts
- Actions `actions/review.actions.ts`: `getMyProductReviewAction`, `submitProductReviewAction` (rating 1–5 int, body 10–2000, title ≤100, **requires `hasProductEntitlement`**, upsert on `userId_productId`, `isVerified/isPublished: true`, revalidates program pages).
- `components/reviews/review-prompt.tsx` — progress card while `completedDays < totalDays`, completion card with star radiogroup dialog when finished, thank-you card after review.
- Wired into owned program page with completion computed from program weeks/days + `workoutCompletion` distinct days.

### 3.4 Checkout cross-sell
- `getCrossSellBundles(userId, purchasedProductIds)` on the orders API: published bundles whose items are **all un-owned** (fully purchaseable, sorted by savings, top 2).
- Success page "Complete your library" card (excluded for legacy subscription returns).

---

## 4. Frontend Polish & Bug Fixes

### 4.1 Bundle detail hero redesign
- Original "stacked cards" visual rendered all bundle items absolutely positioned with semi-transparent backgrounds — text overlapped catastrophically on the 11-item Complete bundle.
- Replaced with a clean non-overlapping "Includes" list: up to 5 opaque mini-cards (`truncate` single-line) + "+ N more included" chip. Safe at any item count.
- Save button added; partial-ownership disabled-purchase messaging kept.

### 4.2 Programs search
- Server-side `q` searchParam → `getProducts({ q })` (case-insensitive contains on name/tagline/description).
- GET form (works without JS), preserves kind filter, prefilled input, Clear button, "No results for X" state, tabs preserve `q`.

### 4.3 next/image migration
- 23 `<img>` → `next/image` (`fill` + `sizes` for remote Cloudinary + local `/media/*` assets; fixed width/height for inline previews).
- `res.cloudinary.com` added to `next.config.ts` `remotePatterns`.
- 6 blob-preview images (`URL.createObjectURL`) **kept as `<img>`** with justified eslint-disable (next/image does not support `blob:`).
- lucide `Image` icon collisions resolved via `Image as ImageIcon` (established repo pattern).
- `no-img-element` warnings: **26 → 0**.

### 4.4 Dead surfaces removed
- `/pricing` and `/club` routes → redirect to `/programs`; sitemap updated (removed `/pricing`, added `/programs`, `/bundles`, `/quiz`).
- `constants/routes.ts` corrected; admin CMS editor placeholder fixed; Stripe webhook "View Plans" links → "Explore Programs" → `/programs`.
- a11y: 4 jsx-a11y/alt-text false positives (lucide `Image` renamed) → 0.

### 4.5 Billing page redesign
- Purchases-first: "Your Purchases" card (order count + lifetime total via `prisma.order.aggregate`), link to `/client/orders`, explore CTA when empty. Legacy Stripe details below, conditional.

---

## 5. Testing & Quality Gates

### Pattern
- Vitest with `vi.hoisted` mocks + `vi.mock` of `@/lib/auth`, `@/lib/prisma`, `next/cache`, `@/lib/logger`; **`vi.resetAllMocks()` in `beforeEach` + re-set default implementations** (mockResolvedValue survives clearAllMocks → pollution). Template: `__tests__/server/actions/order-admin.actions.test.ts`.
- Tests added: `referral.service.test.ts` (code reuse/create, resolve, stats), `favorite.actions.test.ts` (toggle/unauth/list ordering), `review.actions.test.ts` (auth/validation/entitlement/upsert), plus existing auth/actions/entitlement/cart/order suites.
- Final suite: **37 files, 296/296 passing**.

### Gates (run before every commit)
```bash
npx tsc --noEmit          # 0 errors
npx eslint .              # 0 errors (warnings: unused-vars ~105, exhaustive-deps 3 — pre-existing)
npx vitest run            # 296/296
npm run build             # 112 pages, compiled clean
```
- Live smoke on `localhost:3000`: all public routes 200, auth-gated routes 307, referral API 401 for guests, quiz combinations validated against DB.
- `react-hooks/*` rules kept at **error** — never downgraded; fixes via async wrapper patterns, declaration order, restructuring.

### Live-data safety
- Production Neon `neondb` contains real user emails (8 users) — never pollute; test auth-gated logic via vitest mocks, verify read-only with `npx tsx` scripts.

---

## 6. Deployment

### Infrastructure
- **VPS** (vmi3574694) hosts the app at `/var/www/Nomica2`.
- **nginx** reverse-proxies `nomitips.com` → Node on `localhost:3000` (no app logic in nginx).
- **systemd** unit `nomitips.service` runs `npm start` (production build) — the only process that must be restarted on deploy.
- **Neon Postgres** is the production database (same instance used in dev — single `neondb`).
- Docker assets exist (`Dockerfile` with standalone output + `docker-compose.yml`) but production runs bare-metal systemd; compose `AUTH_URL` made overridable (`${AUTH_URL:-http://localhost:3000}`), entrypoint `scripts/docker-entrypoint.sh` runs `prisma migrate deploy` on container boot.

### Environment
- `AUTH_URL` drives referral links, email CTAs, sitemap, auth callbacks — **must be `https://nomitips.com` in production**, localhost for local dev.
- `getAppUrl()` chain: `AUTH_URL ?? NEXTAUTH_URL ?? APP_URL ?? NEXT_PUBLIC_APP_URL ?? localhost`.
- `.env` / `.env.local` gitignored; `.env.example` documents all keys incl. prod URL requirement.

### Deploy procedure (verified working)
```bash
cd /var/www/Nomica2
git pull origin main
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
sudo systemctl restart nomitips    # the ONLY step that reloads the app
```
- Verify: `curl -s http://localhost:3000 | grep -c "Sculpt Club"` → `0`, then hard-refresh browser.
- **Never run `npm ci` / `git pull` without restarting `nomitips.service` afterwards** — replacing `node_modules` under the live process breaks assets (caused the unstyled-site incident on 2026-10-16; nginx/pm2 restarts do NOT fix the app).

### Git history
| Commit | Contents |
|---|---|
| `ba8e973` | Core transformation: entitlements, bundles, publication states, admin refund/grant, video gating (108 files) |
| `c1113e2` | Referral, saved items, review prompts, cross-sell, quiz fixes, bundle hero, programs search, next/image, purchases-first billing, order emails, docker hardening (63 files, +2047/−291) |
| `78ea347` | (user) `.vscode/codepause-baselines.json` — harmless editor file, candidate for removal |

---

## 7. Architecture Notes (for future work)

- **Response shape:** server actions return `{ success, data?, error?: { message, code? } }` from `server/utils/response.ts`.
- **Auth helpers:** `auth()`, `requireAuth()`, `requireRole([Role.X])` in `lib/auth.ts`.
- **Nav:** `constants/navigation.ts` (`CLIENT_NAV` incl. Saved + Referrals); icons mapped in `components/layouts/dashboard-layout.tsx` (`favorites: Heart`, `referrals: Gift`).
- **Pricing display:** `formatPrice` from `constants/subscriptions`.
- **Money:** all prices stored as integer cents; display via `formatPrice` or explicit `/100` formatting.
- **Prisma client restart:** `tsx watch` (dev) does NOT reload on `node_modules` changes — restart dev server after every `prisma generate`. Production: rebuild + systemd restart.
- **Base-UI dialogs:** use `render={<Button/>}` prop, not Radix-style `asChild`.
- **PageContent CMS:** optional override layer; public pages are hardcoded with graceful fallbacks (transformations → published reviews → "coming soon") — empty CMS is safe.

---

## 8. Known Limitations / Backlog

1. **Incremental bundle pricing** not implemented — partially-owned bundles cannot be purchased at a discounted delta (honest disabled state shown instead).
2. **Transformation content:** `TransformationSubmission` table empty (0 approved rows) — homepage shows testimonial fallback; real content is owner-supplied via coach/client submission → admin approval flow.
3. **CMS PageContent** empty — optional; public pages fully functional without it.
4. **Prod should eventually move off any remaining dev-mode processes** — verified prod unit runs `npm start`; keep it that way.
5. **`.vscode/codepause-baselines.json`** tracked in repo (commit `78ea347`) — suggest gitignore + `git rm --cached`.
6. **Local `.env` caution:** `AUTH_URL` must stay `localhost:3000` locally (prod value belongs in server env only) — otherwise referral/email links and auth callbacks point at nomitips.com during local dev.
7. **Eslint warnings (pre-existing, non-blocking):** ~105 `no-unused-vars`, 3 `exhaustive-deps`.
8. **Referral rewards:** stats-only today (no automatic credit/reward issuance) — intentionally conservative; rewards engine can be added later without schema changes.

---

## 9. Feature → File Map

| Feature | Key files |
|---|---|
| Referral | `server/services/referral.service.ts`, `actions/referral.actions.ts`, `app/client/(app)/referrals/page.tsx`, `components/referrals/copy-referral-link.tsx`, `prisma/migrations/20261016120000_…`, register flow in `actions/auth.actions.ts` + `components/forms/register-form.tsx` |
| Saved items | `actions/favorite.actions.ts`, `components/favorites/*`, `app/client/(app)/saved/page.tsx` |
| Reviews | `actions/review.actions.ts`, `components/reviews/review-prompt.tsx`, wired in `app/client/(app)/programs/[slug]/page.tsx` |
| Cross-sell | `app/api/orders/[id]/route.ts` (`getCrossSellBundles`), `app/checkout/success/CheckoutSuccessContent.tsx` |
| Quiz | `constants/quiz.ts`, `app/quiz/page.tsx` |
| Search | `app/programs/page.tsx`, `server/services/product.service.ts` (`getProducts({ q })`) |
| Orders/checkout | `actions/checkout.actions.ts`, `app/api/webhooks/stripe/route.ts`, `components/cart/*` |
| Entitlements | `server/services/entitlement.service.ts`, admin grant/revoke under `app/admin/entitlements` |
| Video gating | `app/api/media/videos/[exerciseId]/route.ts` |
| Emails | `server/services/email.service.ts` (order confirmation, verification, reset, admin notify) |
| Deploy | `Dockerfile`, `docker-compose.yml`, `scripts/docker-entrypoint.sh`, server `nomitips.service` (systemd) |

---

*Record compiled 2026-10-16. All gates green at time of writing: tsc 0 · eslint 0 errors · vitest 296/296 · build 112 pages · production verified live on nomitips.com.*
