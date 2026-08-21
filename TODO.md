# Milestone 9 — Production Deployment Readiness

**Start:** Today 11:00 AM
**Goal:** Make NOMICA2 deployable to production with real infrastructure

---

## Status Recap

Completed M1–M8 + Subscription Access Flow:
- Demo content removed, brand/content audited, dead code cleaned
- UI polished, security headers, SEO (robots/sitemap), a11y (skip links, role="alert", aria-labels)
- Loading skeletons, error boundaries, Zod validation on API routes
- Subscription access flow: FeatureGate checks status, payments always accessible

---

## Task Breakdown

### 9A — Database Migrations (Priority: HIGH)

| # | Task | Details |
|---|------|---------|
| 1 | Generate production migration | `npx prisma migrate dev --name init` to create a proper migration file |
| 2 | Verify migration is idempotent | Check SQL for `IF NOT EXISTS`, safe column additions |
| 3 | Document deploy migration command | `npx prisma migrate deploy` for production (not `db push`) |
| 4 | Verify seed script works with migration | `npx tsx prisma/seed.ts` after migrate |

**Files:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`

---

### 9B — Environment Validation (Priority: HIGH)

| # | Task | Details |
|---|------|---------|
| 1 | Add startup env validation | Create `lib/env.ts` that validates all required vars at boot using Zod |
| 2 | Fail fast on missing vars | Throw clear error messages listing which vars are missing |
| 3 | Validate in `server.ts` | Import and call validator before starting the server |
| 4 | Update `.env.example` | Ensure all required vars are documented with descriptions |
| 5 | Add `HOSTNAME` and `PORT` to docs | These are used in `server.ts` but not documented |

**New file:** `lib/env.ts`
**Modified:** `server.ts`, `.env.example`

---

### 9C — Structured Logging (Priority: HIGH)

| # | Task | Details |
|---|------|---------|
| 1 | Install `pino` + `pino-pretty` | Add to dependencies |
| 2 | Create `lib/logger.ts` | Singleton logger with levels: error, warn, info, debug |
| 3 | Replace `console.error` in actions | ~50 locations across `actions/*.actions.ts` |
| 4 | Replace `console.error` in API routes | ~12 locations across `app/api/*` |
| 5 | Replace `console.log` in webhook handler | `app/api/webhooks/stripe/route.ts` (7 instances) |
| 6 | Replace `console.error` in socket handlers | `server/socket/handlers.ts` |
| 7 | Replace `console.error` in email service | `server/services/email.service.ts` |
| 8 | Keep `console.error` in `app/error.tsx` | Error boundary should log to console for browser dev tools |
| 9 | Keep `console.log` in `prisma/seed.ts` | Seed script is dev-only |

**New file:** `lib/logger.ts`
**Modified:** ~20 files (actions, API routes, socket, email service)

---

### 9D — Error Tracking Integration (Priority: MEDIUM)

| # | Task | Details |
|---|------|---------|
| 1 | Install `@sentry/nextjs` | Add to dependencies |
| 2 | Create `sentry.client.config.ts` | Client-side Sentry config with DSN from env |
| 3 | Create `sentry.server.config.ts` | Server-side Sentry config |
| 4 | Create `sentry.edge.config.ts` | Edge runtime Sentry config |
| 5 | Wrap `app/error.tsx` with Sentry | Report errors to Sentry in addition to console |
| 6 | Add `SENTRY_DSN` to `.env.example` | Optional — app works without it |
| 7 | Add source maps upload | For production debugging |

**New files:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
**Modified:** `app/error.tsx`, `.env.example`

---

### 9E — README & Documentation (Priority: MEDIUM)

| # | Task | Details |
|---|------|---------|
| 1 | Replace boilerplate README | Write project-specific README with: overview, tech stack, setup, env vars, deployment |
| 2 | Document local dev setup | `cp .env.example .env`, fill vars, `npm install`, `npx prisma migrate dev`, `npm run db:seed`, `npm run dev` |
| 3 | Document production deploy | `npx prisma migrate deploy`, `npm run build`, `npm start` |
| 4 | Document env vars table | Required vs optional, where to get each key |
| 5 | Update `ARCHITECTURE.md` debt register | Mark M9 items as done, add new items if any |

**Modified:** `README.md`, `docs/ARCHITECTURE.md`

---

### 9F — Production Config (Priority: MEDIUM)

| # | Task | Details |
|---|------|---------|
| 1 | Add `next.config.ts` production settings | `output: "standalone"` for Docker, `poweredByHeader: false` (already done) |
| 2 | Add `Dockerfile` | Multi-stage build with Node 20 Alpine |
| 3 | Add `.dockerignore` | Exclude node_modules, .next, .env, etc. |
| 4 | Add health check endpoint | `app/api/health/route.ts` — returns `{ status: "ok" }` |
| 5 | Verify `.gitignore` covers build artifacts | Check `.next`, `tsconfig.tsbuildinfo`, `.env` |

**New files:** `Dockerfile`, `.dockerignore`, `app/api/health/route.ts`
**Modified:** `next.config.ts`, `.gitignore`

---

## Execution Order

```
9A (DB migrations) → 9B (env validation) → 9C (logging) → 9D (error tracking) → 9E (README) → 9F (config)
```

9A and 9B can be done in parallel. 9C depends on 9B (logger needs env for log level). 9D depends on 9C. 9E and 9F are independent of each other but should come after the core changes.

---

## Estimated Time

| Task | Time |
|------|------|
| 9A — Database migrations | 30 min |
| 9B — Environment validation | 45 min |
| 9C — Structured logging | 90 min |
| 9D — Error tracking | 60 min |
| 9E — README | 30 min |
| 9F — Production config | 45 min |
| **Total** | **~5 hours** |

---

## Acceptance Criteria

- [ ] `npx prisma migrate deploy` succeeds on a fresh DB
- [ ] Server fails to start if required env vars are missing (clear error message)
- [ ] No `console.log`/`console.error` in production server code (except error boundary + seed)
- [ ] Errors are reported to Sentry (if DSN configured)
- [ ] README has complete setup and deploy instructions
- [ ] `docker build` succeeds
- [ ] `GET /api/health` returns 200
- [ ] `npm run build` completes without errors
- [ ] TypeScript clean, ESLint pre-existing only
