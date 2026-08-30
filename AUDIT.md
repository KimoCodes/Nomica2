# NOMITIPS COMPREHENSIVE TECHNICAL AUDIT REPORT

**Date:** August 29, 2026
**Platform:** NomiTips (NOMICA) — Fitness Coaching Platform
**Stack:** Next.js 16.2.9 + Prisma 7.8.0 + Neon PostgreSQL + NextAuth v5 (beta) + Stripe + Cloudinary + Socket.IO

---

## 1. PROJECT STRUCTURE MAP

```
Nomica2/
├── app/                          # 56 pages, 14 API routes
│   ├── (auth)/                   # login, register, verify-email
│   ├── admin/                    # dashboard, analytics, users, coaches, payments, subscriptions, programs
│   ├── api/                      # 14 API route files
│   ├── bundles/                  # bundle listing + [slug]
│   ├── client/(app)/             # 15 client pages (workouts, progress, habits, goals, etc.)
│   ├── coach/(app)/              # 10 coach pages (clients, programs, messages, etc.)
│   ├── onboarding/               # multi-step onboarding wizard
│   ├── pricing/                  # subscription pricing
│   ├── programs/                 # program catalog + [slug]
│   ├── transformations/          # transformation showcase + [id]
│   └── [public pages]            # coming-soon, club, free-guide, quiz, terms, privacy, refund-policy
├── actions/                      # 23 server action files
├── components/                   # 60+ components (ui, forms, analytics, messaging, etc.)
├── constants/                    # 8 constant files (navigation, plans, roles, routes, etc.)
├── lib/                          # 13 utility modules (auth, prisma, stripe, cloudinary, etc.)
├── server/
│   ├── services/                 # 24 service files
│   ├── socket/                   # Socket.IO server (auth, handlers)
│   ├── utils/                    # guards, password, rate-limit, response
│   └── validators/               # 6 Zod schema files
├── prisma/
│   ├── schema.prisma             # 1006 lines, 24 models, 24 enums
│   └── seed.ts
├── types/                        # socket.ts, index.ts
├── server.ts                     # Custom HTTP server (Next.js + Socket.IO)
├── middleware.ts                  # MISSING — no middleware file exists
└── next.config.ts                # standalone output, security headers
```

**Total source files:** 294 (.ts/.tsx/.js/.jsx)

---

## 2. TECHNOLOGY STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2.9 |
| Language | TypeScript | ^5 |
| React | React | 19.2.4 |
| ORM | Prisma | ^7.8.0 |
| Database | Neon PostgreSQL (serverless) | adapter @prisma/adapter-neon ^7.10.0 |
| Auth | NextAuth.js | ^5.0.0-beta.31 |
| JWT | jose | ^6.2.3 |
| Payments | Stripe | ^22.4.0 |
| Media | Cloudinary | ^2.10.0 |
| Realtime | Socket.IO | ^4.8.3 |
| Email | Resend + SMTP (Brevo) | ^6.14.0 / ^7.0.13 |
| Validation | Zod | ^4.4.3 |
| UI | Radix UI + CVA + Tailwind v4 + shadcn | various |
| Charts | Recharts | ^3.10.1 |
| Logging | Pino + pino-pretty | ^10.3.1 |
| Monitoring | Sentry | ^10.71.0 |
| Notifications | sonner (toast) | ^2.0.7 |

---

## 3. DATABASE SCHEMA (24 Models, 24 Enums)

### Core Models
| Model | Purpose | Key Relations |
|-------|---------|---------------|
| **User** | Central user record | → CoachProfile, ClientProfile, Subscription, notifications, messages, purchases, pageVisits, activityLogs |
| **CoachProfile** | Coach-specific data (bio, specialties, approved flag) | → User (1:1), Programs |
| **ClientProfile** | Client-specific data (age, gender, fitness goals, assigned coach) | → User (1:1), Programs, ProgressLogs, CheckIns |
| **VerificationToken** | Email verification tokens | standalone |

### Program & Content
| Model | Purpose |
|-------|---------|
| **Program** | Workout programs (title, description, price, isSellable, features) |
| **ProgramWeek** | Weeks within a program |
| **ProgramDay** | Days within a week |
| **Exercise** | Exercise library (name, muscleGroup, difficulty, instructions) |
| **ProgramExercise** | Junction: day ↔ exercise with sets/reps/duration/notes |
| **ClientProgram** | Program assignments to clients |

### Commerce
| Model | Purpose |
|-------|---------|
| **Product** | Purchasable catalog items (PROGRAM/CHALLENGE/BUNDLE) |
| **BundleItem** | Junction: bundle ↔ child products |
| **Purchase** | One-time purchase records |
| **Review** | Product reviews (1 per user per product) |
| **Subscription** | Stripe subscription tracking |
| **Payment** | Stripe payment records |
| **PaymentRequest** | Manual payment proof submissions |
| **PaymentRequestAuditLog** | Audit trail for payment approvals |

### Coaching & Progress
| Model | Purpose |
|-------|---------|
| **CheckIn** | Weekly client check-ins |
| **CheckInResponse** | Coach feedback on check-ins |
| **ProgressLog** | Progress entries (photos, measurements, milestones) |
| **ProgressPhoto** | Photos attached to progress logs |
| **TransformationSubmission** | Before/after transformation stories |
| **WorkoutCompletion** | Completed workout sessions |
| **WorkoutSetLog** | Individual set logs |

### Social & Engagement
| Model | Purpose |
|-------|---------|
| **Conversation** | 1:1 coach-client conversations |
| **Message** | Messages with read tracking |
| **Notification** | In-app notifications (14 types) |
| **Habit** / **HabitLog** | Habit tracking (water, sleep, protein, steps, etc.) |
| **Goal** | Client goals with status tracking |
| **Favorite** | User favorites (exercises, programs, recipes, articles) |

### Content & Media
| Model | Purpose |
|-------|---------|
| **Media** | Media library with visibility controls |
| **MediaTag** | Tags on media items |
| **SiteSettings** | Global site configuration |
| **LandingContent** | CMS-like landing page sections |

### Free Trials & Early Access
| Model | Purpose |
|-------|---------|
| **FreeTrial** | Admin/granted free trials with expiry |
| **EarlyAccessSubscriber** | Email signups for early access |

### Analytics (NEW)
| Model | Purpose |
|-------|---------|
| **PageVisit** | Page view tracking (path, user, session, device, browser, OS) |
| **ActivityLog** | Audit log for user/system actions |

### Indexes
Well-indexed: most models have indexes on foreign keys, status fields, and common query patterns. Composite unique constraints on natural keys (e.g., `[habitId, date]`, `[programId, weekNumber]`).

---

## 4. FEATURES MAP

### Public Facing
- [x] Landing page with hero, social proof, transformation carousel, stats bar
- [x] Program catalog (`/programs`) with detail pages (`/programs/[slug]`)
- [x] Bundle catalog (`/bundles`) with detail pages (`/bundles/[slug]`)
- [x] Pricing page (`/pricing`) with subscription plans
- [x] Transformation showcase (`/transformations`) with detail pages
- [x] Quiz flow (`/quiz`)
- [x] Free guide landing page (`/free-guide`)
- [x] Coming soon page
- [x] Club page
- [x] Legal pages (Terms, Privacy, Refund Policy)
- [x] SEO: sitemap.ts, robots.ts

### Authentication
- [x] Email/password registration with Zod validation
- [x] Email verification flow
- [x] Login with role-based redirect
- [x] Coach approval gating (login blocked until approved)
- [x] Rate limiting on auth actions (5 attempts / 15 min)
- [x] JWT strategy (HS256, 30-day expiry)

### Client Features
- [x] Onboarding wizard (multi-step)
- [x] Dashboard
- [x] Workout viewer with program details
- [x] Workout completion logging (set-by-set)
- [x] Exercise library
- [x] Progress tracking (photos, measurements, milestones)
- [x] Weight trend charts
- [x] Nutrition info
- [x] Workout timers
- [x] Habit tracking (water, sleep, protein, stretching, steps, vitamins)
- [x] Goal setting
- [x] Favorites
- [x] Weekly check-ins
- [x] Messaging with coach
- [x] Subscription management
- [x] Payment proof submission
- [x] Transformation submissions
- [x] Settings

### Coach Features
- [x] Onboarding form
- [x] Dashboard
- [x] Client management
- [x] Program builder (week/day/exercise CRUD)
- [x] Program duplication
- [x] Exercise CRUD
- [x] Media library (upload, organize, visibility controls)
- [x] Subscription management for clients
- [x] Payment request management
- [x] Check-in responses
- [x] Transformation review
- [x] Messaging with clients
- [x] Program assignment to clients

### Admin Features
- [x] Dashboard
- [x] Analytics dashboard (page visits, activity logs, charts)
- [x] User management
- [x] Coach approval
- [x] Subscription management (approve/revoke)
- [x] Payment management (approve/reject/request proof)
- [x] Program management (CRUD, sellable toggle)
- [x] Free trial granting

### System Features
- [x] Real-time messaging via Socket.IO
- [x] File uploads via Cloudinary
- [x] Email sending (Resend primary, Brevo SMTP fallback)
- [x] In-app notifications (14 types)
- [x] Structured logging (Pino)
- [x] Sentry error monitoring
- [x] Analytics tracking (visits + activity)
- [x] Entitlement system (subscription OR free trial OR purchase OR bundle)
- [x] Request-level caching (5s TTL, 200 entries LRU)

---

## 5. ROLES & PERMISSIONS MATRIX

| Feature | ADMIN | COACH | CLIENT |
|---------|:-----:|:-----:|:------:|
| View public pages | ✓ | ✓ | ✓ |
| Register/Login | ✓ | ✓ | ✓ |
| Access own dashboard | ✓ | ✓ | ✓ |
| Manage own profile | ✓ | ✓ | ✓ |
| View all users | ✓ | ✗ | ✗ |
| Approve/revoke coaches | ✓ | ✗ | ✗ |
| Manage subscriptions (approve/revoke) | ✓ | ✗ | ✗ |
| Manage payments (approve/reject) | ✓ | ✗ | ✗ |
| Manage all programs | ✓ | ✗ | ✗ |
| View analytics | ✓ | ✗ | ✗ |
| Grant free trials | ✓ | ✗ | ✗ |
| Manage clients | ✗ | ✓ | ✗ |
| Create/edit own programs | ✗ | ✓ | ✗ |
| Manage exercises | ✗ | ✓ | ✗ |
| Upload/manage media | ✗ | ✓ | ✗ |
| Respond to check-ins | ✗ | ✓ | ✗ |
| Review transformations | ✗ | ✓ | ✗ |
| Assign programs to clients | ✗ | ✓ | ✗ |
| Message clients | ✗ | ✓ | ✓ (own coach) |
| View own workouts | ✗ | ✗ | ✓ |
| Log workout completions | ✗ | ✗ | ✓ |
| Track progress | ✗ | ✗ | ✓ |
| Submit check-ins | ✗ | ✗ | ✓ |
| Submit transformations | ✗ | ✗ | ✓ |
| Manage subscription | ✗ | ✗ | ✓ |
| Submit payment proofs | ✗ | ✗ | ✓ |

**Enforcement:** Server-side via `requireRole()` in layout files + `assertRole()` in services. Route groups enforce role at layout level (`admin/layout.tsx`, `client/(app)/layout.tsx`, `coach/(app)/layout.tsx`).

---

## 6. USER FLOWS

### Client Registration → Onboarding → First Workout
1. Register at `/register` (name, email, password)
2. Receive verification email → verify at `/verify-email`
3. Login → redirected to `/onboarding` (if not completed)
4. Complete onboarding wizard (fitness goals, equipment, etc.)
5. Redirected to `/client` dashboard
6. Subscription required for content access (or free trial)

### Coach Registration → Approval → Client Management
1. Register at `/register` with role=COACH
2. Login blocked until admin approves (`coachProfile.approved`)
3. After approval → `/coach/onboarding`
4. Complete onboarding → access coach dashboard
5. Create programs, manage clients, respond to check-ins

### Admin Subscription Approval
1. Client submits payment proof via `/client/payments`
2. Admin reviews at `/admin/payments`
3. Approve → subscription created/activated
4. Client notified via in-app notification + email

### Program Purchase Flow
1. Client browses `/programs` or `/bundles`
2. Clicks purchase → Stripe checkout
3. Webhook confirms → `Purchase` record created
4. Entitlement derived from purchase (via `entitlement.service.ts`)

### Workout Completion Flow
1. Client views assigned program at `/client/workouts`
2. Opens workout → sees exercises with sets/reps
3. Logs each set (actual reps, weight, completed)
4. Submits completion → `WorkoutCompletion` + `WorkoutSetLog` records

---

## 7. COMPLETE API INVENTORY

### API Routes (14 files)
| Route | Methods | Purpose | Auth |
|-------|---------|---------|------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers | Public |
| `/api/health` | GET | Health check | Public |
| `/api/analytics/track` | POST | Visit tracking | Public |
| `/api/notifications` | GET | User notifications | Auth required |
| `/api/media` | GET | List media | Auth required |
| `/api/media/[id]` | GET | Get/delete media | Auth required |
| `/api/media/upload` | POST | Upload to Cloudinary | Auth required |
| `/api/media/tags` | GET | List media tags | Auth required |
| `/api/payments/upload` | POST | Upload payment proof | Auth required |
| `/api/webhooks/stripe` | POST | Stripe webhooks | Signature verified |
| `/api/coach/transformations` | GET | Coach transformations | Coach role |
| `/api/coach/transformations/[id]` | PATCH | Review transformation | Coach role |
| `/api/client/[id]/transformation` | POST | Submit transformation | Client role |
| `/api/client/[id]/progress` | GET | Client progress data | Client role |

### Server Actions (23 files)
| File | Key Actions |
|------|------------|
| `auth.actions.ts` | registerUser, preCheckLogin, logoutUser, verifyEmail |
| `settings.actions.ts` | updateProfile, updateProgramSellableAction, deleteProgramAction |
| `program.actions.ts` | createProgramAction, duplicateProgramAction, deleteProgramAction |
| `assignment.actions.ts` | assignProgramToClient, deactivateAssignment |
| `workout.actions.ts` | completeWorkout, logWorkoutSets |
| `checkin.actions.ts` | submitCheckIn, respondToCheckIn |
| `progress.actions.ts` | logProgress, coachComment |
| `payment-request.actions.ts` | submitPaymentRequest, approvePaymentRequest, rejectPaymentRequest |
| `subscription.actions.ts` | changePlan, cancelSubscription, approveSubscription, revokeSubscription |
| `checkout.actions.ts` | createCheckoutSession |
| `message.actions.ts` | sendMessage, markAsRead |
| `notifications.actions.ts` | markNotificationRead, markAllRead |
| `exercise.actions.ts` | createExercise, updateExercise, deleteExercise |
| `admin.actions.ts` | admin user management |
| `free-trial.actions.ts` | grantFreeTrial, cancelFreeTrial |
| `goals.actions.ts` | CRUD goals |
| `habits.actions.ts` | CRUD habits, logHabit |
| `favorites.actions.ts` | toggleFavorite |
| `upload.actions.ts` | upload media |
| `onboarding.actions.ts` | completeOnboarding |
| `logout.action.ts` | server-side signOut |
| `free-guide.actions.ts` | lead magnet submission |
| `coming-soon.actions.ts` | early access signup |

---

## 8. AUTHENTICATION & SECURITY AUDIT

### Authentication
- **Provider:** NextAuth v5 beta with Credentials provider
- **Strategy:** JWT (HS256 via jose, 30-day expiry)
- **Password hashing:** bcrypt (via `server/utils/password.ts`)
- **Email verification:** Required before login (24-hour token expiry)
- **Coach gating:** Unapproved coaches cannot log in

### Security Headers (next.config.ts)
- `X-Frame-Options: DENY` — clickjacking protection
- `X-Content-Type-Options: nosniff` — MIME sniffing prevention
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-DNS-Prefetch-Control: on`
- `poweredByHeader: false` — hides Next.js fingerprint

### Rate Limiting
- In-memory rate limiter (`server/utils/rate-limit.ts`) — 5 attempts / 15 min for auth actions
- **ISSUE:** In-memory store does not work across multiple server instances (serverless/clustered)
- **ISSUE:** Rate limit store grows unbounded (no TTL eviction)

### Input Validation
- Zod schemas in `server/validators/` for auth, messages, programs, progress, transformations, onboarding
- Prisma provides type safety for DB queries

### Security Issues Found

| Severity | Issue |
|----------|-------|
| **CRITICAL** | `.env` file contains live API keys (Neon DB password, Stripe test keys, Cloudinary secrets, Brevo API key, SMTP credentials) committed to repo |
| **CRITICAL** | No middleware.ts — no edge-level auth guard; all auth checks are server-side only (layout files run in Node.js, not Edge) |
| **HIGH** | Rate limiter is in-memory only — resets on restart, doesn't work in multi-instance deployments |
| **HIGH** | No CSRF protection beyond NextAuth's built-in (may be insufficient for some flows) |
| **HIGH** | No brute-force protection beyond rate limiting (no account lockout) |
| **MEDIUM** | Socket.IO CORS origin uses `AUTH_URL` (localhost in dev) — needs production URL |
| **MEDIUM** | `trustHost: true` in auth config — disables host validation |
| **LOW** | No Content-Security-Policy header configured |

---

## 9. BUSINESS LOGIC AUDIT

### Entitlement System (`entitlement.service.ts`)
Well-designed 4-tier access model:
1. Active All-Access subscription → full access
2. Active free trial → full access
3. Direct product purchase → access to that product
4. Bundle purchase → access to all bundle children

**Status:** Correctly implemented. Entitlements are derived, not stored.

### Subscription Management
- Stripe webhook handling covers: checkout.session.completed, subscription created/updated/deleted, invoice payment succeeded/failed
- Manual subscription approval by admin (for offline payments)
- Plan changes with Stripe proration
- Cancel-at-period-end with reactivation support
- Expiring subscription notifications (3-day warning)

### Free Trial System
- Admin-granted trials with configurable duration
- Expiry checking with automatic status updates
- Notification on grant, expiry warning, and cancellation

### Program Sellable Toggle
- When marked sellable → creates Product record
- When unmarked → deactivates Product
- Cascades to homepage catalog display

### Issues Found

| Severity | Issue |
|----------|-------|
| **MEDIUM** | No idempotency keys on Stripe webhook processing (duplicate events could create duplicate records) |
| **MEDIUM** | Subscription approval creates `stripeCustomerId: manual_{userId}` — non-Stripe IDs could confuse future Stripe integration |
| **MEDIUM** | No webhooks for Stripe events like `charge.refunded` — refunds not auto-synced |
| **LOW** | Free trial expiry is checked on access but no background job to proactively expire/clean up |
| **LOW** | `changePlan` does not handle the case where Stripe price IDs are placeholders gracefully in all code paths |

---

## 10. FRONTEND/UI AUDIT

### Component Library
- **UI primitives:** Custom shadcn-based components (button, input, select, dialog, table, badge, card, tabs, etc.)
- **Layout:** Dashboard layout with role-specific sidebars (`DashboardLayout`)
- **Public layout:** Separate public layout for marketing pages
- **Subscription guard:** Client app wrapped in `SubscriptionGuard` that shows subscription status

### Pages (56 total)
- **Auth (3):** login, register, verify-email
- **Admin (6):** dashboard, analytics, users, coaches, payments, subscriptions, programs
- **Coach (10):** dashboard, clients, programs, exercises, media, subscriptions, payments, messages, check-ins, transformations
- **Client (15):** dashboard, workouts, exercise-library, media, nutrition, timers, habits, goals, favorites, progress, messages, check-ins, subscription, payments
- **Public (12):** homepage, pricing, programs, bundles, transformations, quiz, club, free-guide, coming-soon, terms, privacy, refund-policy
- **Shared (2):** settings, onboarding

### UI Quality
- Consistent Tailwind v4 usage
- Responsive design via Tailwind
- Loading states with Skeleton and Spinner components
- Toast notifications via sonner
- Charts for analytics (Recharts) and progress (weight trends)

### Issues Found

| Severity | Issue |
|----------|-------|
| **MEDIUM** | No loading.tsx files at route level — no Suspense boundaries for streaming |
| **MEDIUM** | No error boundaries per route (only root `error.tsx`) |
| **LOW** | No dark mode implementation despite `next-themes` being installed |
| **LOW** | Some components use `document.querySelector` (e.g., `nutrition-client.tsx`) — SSR incompatible |

---

## 11. ERROR HANDLING & RELIABILITY

### Error Handling Patterns
- Server actions use `createSuccessResponse`/`createErrorResponse` wrapper
- Services throw typed errors (`EMAIL_EXISTS`, `RATE_LIMITED`, etc.)
- Root `error.tsx` catches unhandled errors
- `not-found.tsx` handles 404s
- Sentry configured for error tracking (production only, 10% sample rate)

### Logging
- Pino logger with `pino-pretty` in development
- Structured logging with context (route, action, error)
- Cookie filtering in Sentry events

### Issues Found

| Severity | Issue |
|----------|-------|
| **MEDIUM** | No retry logic for external service calls (Stripe, Cloudinary, email) |
| **MEDIUM** | No circuit breaker pattern for failing services |
| **LOW** | Error responses don't always include consistent error codes |

---

## 12. PERFORMANCE AUDIT

### Caching
- Request-level cache (`lib/request-cache.ts`) — 5s TTL, 200 entries LRU
- Cache invalidation on data mutation (`invalidateRequestCache`)
- Static asset caching: 1 year immutable for images/fonts

### Database
- Well-indexed schema (most foreign keys + status fields indexed)
- Prisma Neon adapter for serverless Postgres
- Connection pooling via Neon pooler
- No N+1 query patterns detected in services

### Bundle Size Concerns
- `recharts` (~400KB) included for admin analytics only
- `socket.io-client` included in client bundle
- `@sentry/nextjs` adds bundle overhead

### Issues Found

| Severity | Issue |
|----------|-------|
| **MEDIUM** | No code splitting or dynamic imports for heavy components (recharts, analytics dashboard) |
| **MEDIUM** | `getVisitStats` does 3 parallel queries (count + 2 findMany with distinct) — could be optimized with raw SQL |
| **LOW** | No image optimization configuration beyond remotePatterns |

---

## 13. PRODUCTION & DEPLOYMENT

### Configuration
- `output: "standalone"` — optimized for Docker/container deployment
- Custom `server.ts` with HTTP server + Socket.IO (requires `tsx` runtime)
- Environment validation at startup (`lib/env.ts`) — validates all required vars

### Deployment Readiness

| Aspect | Status |
|--------|--------|
| Standalone output | ✓ |
| Environment validation | ✓ |
| Sentry integration | ✓ (but no DSN configured) |
| Health check endpoint | ✓ (`/api/health`) |
| Security headers | ✓ |
| Database migrations | ✓ (single migration applied) |
| Custom server | ⚠️ Requires `tsx` — may conflict with some PaaS platforms |

### Issues Found

| Severity | Issue |
|----------|-------|
| **CRITICAL** | No `SENTRY_DSN` configured — Sentry is disabled |
| **CRITICAL** | No `STRIPE_WEBHOOK_SECRET` configured (`whsec_placeholder`) |
| **HIGH** | Stripe Price IDs are placeholders — payments will fail |
| **HIGH** | No production database migration strategy (currently `prisma migrate deploy`) |
| **MEDIUM** | Custom `server.ts` with `tsx watch` is dev-only pattern; production needs `tsx server.ts` |
| **MEDIUM** | No Dockerfile or deployment configuration |
| **MEDIUM** | `NEON_BRANCH=production` env var set but unclear if Neon branching is used |

---

## 14. TESTING AUDIT

### Current State
- **ZERO tests** — no test files, no test framework configured
- No `jest.config`, `vitest.config`, or any test runner
- No `__tests__` directories
- No `.test.ts` or `.spec.ts` files
- No test scripts in `package.json`

### Testing Gaps
- No unit tests for services
- No integration tests for API routes/actions
- No E2E tests
- No component tests
- No schema validation tests

---

## 15. DATA & PRIVACY AUDIT

### Data Collected
- **PII:** Name, email, password (hashed), body measurements, progress photos
- **Payment:** Stripe customer IDs, subscription IDs, payment proofs
- **Analytics:** IP addresses, user agents, page visits, device/browser/OS
- **Usage:** Habit logs, workout completions, goal progress

### Data Protection
- Passwords hashed with bcrypt
- Email verification required
- Sentry filters cookies from error reports
- Media visibility controls (COACH_ONLY, CLIENT_ONLY, TEAM_ONLY, PUBLIC)

### Issues Found

| Severity | Issue |
|----------|-------|
| **HIGH** | No data retention/deletion policy implemented |
| **HIGH** | No GDPR/CCPA compliance features (data export, right to deletion) |
| **MEDIUM** | IP addresses stored in PageVisit and ActivityLog — potential PII concern |
| **MEDIUM** | No data anonymization for analytics |
| **LOW** | No cookie consent banner (despite analytics tracking) |

---

## 16. TECHNICAL DEBT & CODE QUALITY

### Positive Patterns
- Consistent file naming conventions
- Service layer separates business logic from actions
- Zod validation schemas
- Structured error handling with typed responses
- Consistent use of Prisma for DB access
- Proper TypeScript typing throughout

### Technical Debt

| Item | Location | Impact |
|------|----------|--------|
| `@auth/prisma-adapter` in deps but not used (JWT strategy bypasses it) | `package.json` | Unnecessary dependency |
| `@supabase/server` in deps — unclear usage | `package.json` | Unused dependency |
| `@base-ui/react` in deps — unclear usage | `package.json` | Unused dependency |
| Socket.IO handler registration in `handlers.ts` — needs review for memory leaks | `server/socket/` | Potential memory leak |
| No `middleware.ts` — all auth is server-side layout level | Root | Inconsistent auth boundary |
| No `.env.example` file | Root | Onboarding friction |

---

## 17. MISSING FEATURES IDENTIFIED

### Critical for Launch
1. **Stripe Price IDs** — currently placeholders, payments will fail
2. **Stripe Webhook Secret** — required for signature verification
3. **Sentry DSN** — error monitoring disabled
4. **Production middleware.ts** — edge-level auth guard
5. **Test suite** — zero test coverage

### Important
6. Dark mode (next-themes installed but not implemented)
7. Data export/deletion (GDPR compliance)
8. Cookie consent banner
9. Background job for free trial expiry
10. Loading states at route level (Suspense/streaming)
11. Per-route error boundaries
12. Rate limiter persistence (Redis)

### Nice to Have
13. CI/CD pipeline
14. Docker configuration
15. Rate limiting beyond auth (API abuse prevention)
16. CSP headers
17. Idempotency keys for Stripe webhooks
18. E2E test suite

---

## 18. SCORECARD

| Category | Score | Notes |
|----------|:-----:|-------|
| **Architecture** | 8/10 | Clean Next.js App Router, service layer, good separation of concerns |
| **Database Design** | 8/10 | Well-indexed, proper relations, comprehensive enums |
| **Authentication** | 7/10 | Working but missing middleware, no brute-force protection |
| **Authorization** | 8/10 | Role-based at layout level, consistent enforcement |
| **API Design** | 7/10 | Good action patterns, but no rate limiting on most endpoints |
| **Frontend** | 7/10 | Functional but missing loading/error boundaries, dark mode |
| **Security** | 5/10 | Secrets in .env committed, no CSP, weak rate limiting |
| **Testing** | 0/10 | Zero test coverage |
| **Error Handling** | 6/10 | Good patterns but no retries, no circuit breakers |
| **Performance** | 7/10 | Good caching, but no code splitting for heavy deps |
| **DevOps** | 4/10 | No CI/CD, no Docker, no deployment config |
| **Documentation** | 6/10 | Good code comments but no ADR, no API docs |
| **Data Privacy** | 5/10 | No GDPR features, IP logging concerns |
| **Business Logic** | 8/10 | Entitlement system is well-designed |

**Overall: 6.2/10** — Solid codebase with strong architecture, but critical gaps in security, testing, and deployment readiness.

---

## 19. PRODUCTION LAUNCH ROADMAP

### Phase 1: Critical Fixes (Before Launch)
1. Rotate all secrets (`.env` contains committed keys)
2. Set up proper secret management (Vercel env vars, Doppler, etc.)
3. Configure Stripe Price IDs and Webhook Secret
4. Configure Sentry DSN
5. Add `middleware.ts` for edge-level auth
6. Write critical path tests (auth, payments, entitlements)
7. Add `.env.example`

### Phase 2: Security Hardening (Week 1-2)
8. Redis-based rate limiter
9. CSRF protection audit
10. CSP headers
11. Account lockout after failed attempts
12. Data retention policies
13. Cookie consent banner

### Phase 3: Reliability (Week 2-3)
14. Retry logic for external services
15. Circuit breaker pattern
16. Background job for trial expiry
17. Loading states (Suspense boundaries)
18. Per-route error boundaries

### Phase 4: Operations (Week 3-4)
19. CI/CD pipeline (GitHub Actions)
20. Docker configuration
21. Monitoring dashboards
22. Log aggregation
23. Database backup strategy

---

## 20. HANDOFF DOCUMENTATION

### Key Files to Know
- **Entry point:** `server.ts` (custom HTTP + Socket.IO server)
- **Auth config:** `lib/auth.ts` + `lib/auth.config.ts`
- **DB schema:** `prisma/schema.prisma`
- **Env validation:** `lib/env.ts`
- **Entitlements:** `server/services/entitlement.service.ts`
- **Navigation:** `constants/navigation.ts`

### Development Commands
```bash
npm run dev          # Start dev server (tsx watch)
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run lint         # ESLint
```

### Architecture Decisions
1. **JWT over sessions** — Stateless auth, works with Socket.IO
2. **Service layer** — Business logic in `server/services/`, not in actions
3. **Derived entitlements** — Never store access; compute from subscription/purchase/trial
4. **Custom server.ts** — Required for Socket.IO integration
5. **Neon serverless** — Database scales to zero, requires pooler for connections

---

## 21. SUMMARY

**NomiTips** is a well-architected fitness coaching platform with a comprehensive feature set covering client management, workout programming, progress tracking, messaging, payments, and content delivery. The codebase is clean, well-organized, and follows modern Next.js patterns.

**Key Strengths:**
- Clean architecture with service layer separation
- Comprehensive Prisma schema with proper indexing
- Well-designed entitlement system
- Good TypeScript coverage
- Structured logging and error handling patterns

**Critical Gaps:**
- Zero test coverage
- Committed secrets in `.env`
- Missing production configurations (Stripe, Sentry)
- No middleware.ts for edge auth
- No CI/CD or deployment configuration
- No GDPR compliance features

**Recommendation:** Do not launch to production until Phase 1 (Critical Fixes) and Phase 2 (Security Hardening) are complete. The codebase is strong — these are operational/security gaps, not architectural flaws.
