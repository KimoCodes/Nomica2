# NOMICA2 — Comprehensive Client-Side Audit Report

**Date:** 2026-08-06
**Codebase:** Next.js 16.2.9 + React 19 + Prisma 7 + PostgreSQL + Stripe + Socket.io + Cloudinary

---

## AUDIT MATRIX

### Phase 1: System Architecture

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js App Router | ✅ Implemented | Server-first architecture, proper RSC usage |
| TypeScript strict mode | ✅ Implemented | Full type safety |
| Prisma ORM | ✅ Implemented | 25+ models, 4 migrations |
| Authentication (NextAuth v5) | ✅ Implemented | Credentials provider, JWT |
| Role-based access (Admin/Coach/Client) | 🟡 Partially | Layout guards work, but middleware is INACTIVE |
| Server Actions | ✅ Implemented | 16 action files, clean service layer |
| Socket.io messaging | ✅ Implemented | Real-time chat with typing indicators |
| Stripe payments | ✅ Implemented | Subscriptions + one-time purchases |
| Cloudinary uploads | ✅ Implemented | Images + videos with thumbnails |
| Tailwind CSS v4 | ✅ Implemented | Premium design system, dark mode ready |
| shadcn/ui | ✅ Implemented | 18 base components |
| SEO (sitemap, robots) | ✅ Implemented | Dynamic sitemap, robots.txt |

### Phase 2: Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Sign Up | ✅ Implemented | With email verification |
| Sign In | ✅ Implemented | Credentials provider |
| Logout | ✅ Implemented | Session destruction |
| Forgot Password | ❌ Missing | No forgot/reset password flow |
| Reset Password | ❌ Missing | No reset password flow |
| Email Verification | ✅ Implemented | Token-based verification |
| Profile Completion | ✅ Implemented | Onboarding wizard (4 steps) |
| Session Persistence | ✅ Implemented | JWT 30-day expiry |
| Token Refresh | ✅ Implemented | Custom JWT encode/decode |
| Protected Routes | 🔴 BROKEN | proxy.ts NOT exported as middleware — all route protection INACTIVE |
| Role-based Access | 🟡 Partially | Layout guards work, middleware broken |
| Secure Logout | ✅ Implemented | signOut + redirect |
| Error Handling | ✅ Implemented | preCheckLogin with specific errors |
| Form Validation | ✅ Implemented | Zod schemas (duplicated client/server) |
| Loading Indicators | 🟡 Partially | Login has isPending, register missing |

### Phase 3: Subscription System

| Feature | Status | Notes |
|---------|--------|-------|
| Membership Plans | ✅ Implemented | Monthly + Annual via Stripe |
| Subscription Comparison | ✅ Implemented | Plan cards with features |
| Payment Page | ✅ Implemented | Form + history |
| Upload Payment Proof | ✅ Implemented | Cloudinary, 10MB, images+PDF |
| Payment History | 🟡 Partially | Last 20 only, no pagination |
| Pending Verification Status | ✅ Implemented | Status badges |
| Active Subscription | ✅ Implemented | Plan, status, billing date |
| Expired Subscription | 🟡 Partially | No explicit "expired" state |
| Cancelled Subscription | ✅ Implemented | Cancel-at-period-end banner |
| Remaining Days | ❌ Missing | Only shows date, no days calculation |
| Expiration Date | ✅ Implemented | Shows currentPeriodEnd |
| Renewal Reminders | 🟡 Partially | Backend exists but runs on page load, not cron |

### Phase 4: Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Welcome Section | ✅ Implemented | Personalized greeting |
| User Profile Summary | ✅ Implemented | Avatar, name, role |
| Subscription Status | ✅ Implemented | Banner for inactive |
| Current Program | ✅ Implemented | Program overview card |
| Today's Workout | ✅ Implemented | Exercise list |
| Today's Nutrition | ❌ Missing | No nutrition widget |
| Coach Announcements | ❌ Missing | No announcements section |
| Progress Summary | ✅ Implemented | Weight trend chart |
| Current Streak | ✅ Implemented | Workout streak counter |
| Upcoming Check-in | ✅ Implemented | Check-in status card |
| Quick Actions | ✅ Implemented | Workout, progress, messages |
| Recent Activity | ❌ Missing | No activity feed |

### Phase 5: Workout Experience

| Feature | Status | Notes |
|---------|--------|-------|
| Program Library | ✅ Implemented | DB-driven catalog |
| Program Details | ✅ Implemented | Slug-based detail pages |
| Daily Workouts | ✅ Implemented | Today's workout with exercises |
| Workout Calendar | ❌ Missing | No calendar view |
| Exercise List | ✅ Implemented | Full exercise library |
| Exercise Detail Page | ❌ Missing | No individual exercise page |
| Exercise Videos | 🟡 Partially | Links to external, no embed |
| Instructions | ✅ Implemented | Per-exercise instructions |
| Sets | ✅ Implemented | Logged in tracker |
| Repetitions | ✅ Implemented | Logged in tracker |
| Rest Timer | ✅ Implemented | Dedicated timers page |
| Difficulty | ✅ Implemented | Exercise difficulty levels |
| Equipment | ✅ Implemented | Equipment field |
| Workout Duration | ❌ Missing | No duration tracking |
| Target Muscles | ✅ Implemented | Muscle group tags |
| Complete Workout | ✅ Implemented | Completion form |
| Resume Workout | 🟡 Partially | Can revisit, but no in-progress save |
| Skip Workout | ❌ Missing | No skip functionality |
| Favorite Workouts | ❌ Missing | No favorites system |
| Workout History | 🟡 Partially | Recent completions only |

### Phase 6: Nutrition

| Feature | Status | Notes |
|---------|--------|-------|
| Meal Plans | 🟡 Partially | Static sample, not personalized |
| Daily Nutrition | ❌ Missing | No daily tracker |
| Recipes | ❌ Missing | No recipe database |
| Grocery Lists | ❌ Missing | No grocery list |
| Calories | 🟡 Partially | Calculator only, no logging |
| Protein Goals | 🟡 Partially | Calculator only |
| Macronutrients | 🟡 Partially | Calculator only |
| Water Tracker | ❌ Missing | No water tracking |
| Supplement Recommendations | ✅ Implemented | Static table |
| Meal Completion | ❌ Missing | No meal logging |
| Favorite Recipes | ❌ Missing | No favorites |

### Phase 7: Progress Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Weight Tracking | ✅ Implemented | Log + chart |
| Body Measurements | ✅ Implemented | Waist, chest, hips |
| Body Fat | ✅ Implemented | Body fat % logging |
| BMI | ❌ Missing | Not calculated |
| Strength Tracking | ❌ Missing | No strength PR tracking |
| Progress Charts | ✅ Implemented | Weight trend (Recharts) |
| Historical Timeline | ✅ Implemented | Vertical timeline |
| Progress Summaries | 🟡 Partially | Stats cards only |

### Phase 8: Progress Photos

| Feature | Status | Notes |
|---------|--------|-------|
| Front Photo | ✅ Implemented | Upload with angle |
| Side Photo | ✅ Implemented | Upload with angle |
| Back Photo | ✅ Implemented | Upload with angle |
| Before/After Comparison | ❌ Missing | No comparison view |
| Timeline | ✅ Implemented | Photo timeline |
| Secure Private Storage | ✅ Implemented | Cloudinary |
| Upload Validation | ✅ Implemented | File size, type |
| Image Preview | ✅ Implemented | Thumbnail + dialog |
| Zoom | ❌ Missing | No zoom on photos |

### Phase 9: Weekly Check-ins

| Feature | Status | Notes |
|---------|--------|-------|
| Weight | ✅ Implemented | In check-in form |
| Measurements | ❌ Missing | Not in check-in form |
| Photos | ❌ Missing | No photo upload in check-in |
| Energy Level | ✅ Implemented | 1-10 scale |
| Mood | ❌ Missing | Not in form |
| Sleep | ✅ Implemented | 1-10 scale |
| Water Intake | ❌ Missing | Not in form |
| Notes | ❌ Missing | No free-text field |
| Coach Feedback | ✅ Implemented | Response display |

### Phase 10: Coach Communication

| Feature | Status | Notes |
|---------|--------|-------|
| Messaging | ✅ Implemented | Real-time Socket.io |
| Coach Feedback | ✅ Implemented | Check-in responses |
| Announcements | ❌ Missing | No announcements system |
| File Sharing | 🟡 Partially | Image upload only |
| Images | ✅ Implemented | Image upload in chat |
| Video Attachments | ❌ Missing | No video upload in chat |
| Voice Notes | ❌ Missing | Not supported |
| Read Receipts | 🟡 Partially | Local only, no real tracking |
| Typing Indicators | ✅ Implemented | Real-time |
| Notification Integration | 🟡 Partially | Backend exists, no UI badge |

### Phase 11: Community

| Feature | Status | Notes |
|---------|--------|-------|
| Community Feed | ❌ Missing | No community feature |
| Posts | ❌ Missing | — |
| Images | ❌ Missing | — |
| Comments | ❌ Missing | — |
| Likes | ❌ Missing | — |
| Success Stories | 🟡 Partially | Transformations page exists but static |
| Challenges | ❌ Missing | No challenges system |
| Community Guidelines | ❌ Missing | — |

### Phase 12: Goals & Habits

| Feature | Status | Notes |
|---------|--------|-------|
| Goals (lose weight, build muscle, etc.) | ❌ Missing | No goals system |
| Habit Tracker (water, sleep, protein, etc.) | ❌ Missing | No habit tracking |
| Daily Streaks | 🟡 Partially | Workout streak only |
| Completion Percentages | ❌ Missing | — |
| Progress Bars | ❌ Missing | — |

### Phase 13: Educational Resources

| Feature | Status | Notes |
|---------|--------|-------|
| Articles | ❌ Missing | No resources section |
| Videos | ❌ Missing | — |
| PDFs | ❌ Missing | — |
| Workout Guides | ❌ Missing | — |
| Nutrition Education | ❌ Missing | — |
| Recovery Education | ❌ Missing | — |
| Mindset Education | ❌ Missing | — |
| Women's Health Resources | ❌ Missing | — |
| Categories | ❌ Missing | — |
| Search/Filter | ❌ Missing | — |
| Favorites | ❌ Missing | — |

### Phase 14: Notifications

| Feature | Status | Notes |
|---------|--------|-------|
| In-app Notifications | 🟡 Partially | API exists, no UI component |
| Workout Reminders | ❌ Missing | — |
| Coach Messages | 🟡 Partially | Via messaging only |
| Subscription Reminders | 🟡 Partially | Backend exists |
| Payment Approval | ✅ Implemented | Via notifications table |
| Challenge Reminders | ❌ Missing | — |
| Check-in Reminders | ❌ Missing | — |
| Notification Badges | ❌ Missing | No badge UI |

### Phase 15: Downloads

| Feature | Status | Notes |
|---------|--------|-------|
| PDFs | ❌ Missing | No download functionality |
| Workout Plans | ❌ Missing | — |
| Meal Plans | ❌ Missing | — |
| Grocery Lists | ❌ Missing | — |
| Educational Resources | ❌ Missing | — |

### Phase 16: Settings

| Feature | Status | Notes |
|---------|--------|-------|
| Profile | ✅ Implemented | Name edit, email display |
| Password | ✅ Implemented | Change password form |
| Units | ❌ Missing | No unit preference (kg/lbs) |
| Theme | 🟡 Partially | Dark mode CSS exists, no toggle UI |
| Language | ❌ Missing | No i18n |
| Notification Preferences | ❌ Missing | Placeholder only |
| Privacy Settings | ❌ Missing | — |

### Phase 17: Achievements

| Feature | Status | Notes |
|---------|--------|-------|
| Badges | ❌ Missing | No achievements system |
| First Workout | ❌ Missing | — |
| 7-Day Streak | ❌ Missing | — |
| 30-Day Streak | ❌ Missing | — |
| Goal Completed | ❌ Missing | — |
| Program Completed | ❌ Missing | — |

### Phase 18: Search

| Feature | Status | Notes |
|---------|--------|-------|
| Global Search | ❌ Missing | No search across content |
| Exercise Search | ✅ Implemented | Client-side in library |
| Program Search | ❌ Missing | — |
| Recipe Search | ❌ Missing | — |
| Article Search | ❌ Missing | — |

### Phase 19: Favorites

| Feature | Status | Notes |
|---------|--------|-------|
| Favorite Exercises | ❌ Missing | No favorites system |
| Favorite Programs | ❌ Missing | — |
| Favorite Recipes | ❌ Missing | — |
| Favorite Videos | ❌ Missing | — |
| Favorite Articles | ❌ Missing | — |

### Phase 20: Mobile Experience

| Feature | Status | Notes |
|---------|--------|-------|
| Responsive Layouts | ✅ Implemented | Mobile-first Tailwind |
| Mobile Navigation | ✅ Implemented | Hamburger menu dialog |
| Touch Interactions | 🟡 Partially | Basic touch, no gestures |
| Loading Performance | 🟡 Partially | No lazy loading of heavy components |
| Orientation Handling | 🟡 Partially | CSS handles, no JS |
| Small-screen Usability | ✅ Implemented | — |
| Offline-friendly | ❌ Missing | No service worker |

### Phase 21: Accessibility

| Feature | Status | Notes |
|---------|--------|-------|
| Keyboard Navigation | 🟡 Partially | Skip-to-content exists |
| Screen-reader Support | 🟡 Partially | Some ARIA labels |
| Proper Labels | 🟡 Partially | Forms use Label component |
| Focus Indicators | 🟡 Partially | Default browser focus |
| Color Contrast | ✅ Implemented | Premium design system |
| Semantic HTML | ✅ Implemented | — |
| Accessible Forms | 🟡 Partially | Labels present, some missing |

### Phase 22: Performance

| Feature | Status | Notes |
|---------|--------|-------|
| Lazy Loading | ❌ Missing | No dynamic imports |
| Code Splitting | 🟡 Partially | Next.js automatic |
| Image Optimization | 🟡 Partially | Cloudinary handles |
| Bundle Size | 🟡 Partially | No analysis done |
| API Efficiency | 🟡 Partially | Request cache exists |
| Component Rendering | 🟡 Partially | No memoization |
| Caching | 🟡 Partially | In-memory cache (5s TTL) |
| Skeleton Loaders | 🟡 Partially | loading.tsx files exist |

### Phase 23: UI/UX Consistency

| Feature | Status | Notes |
|---------|--------|-------|
| Consistent Spacing | ✅ Implemented | Tailwind utilities |
| Typography | ✅ Implemented | Geist font family |
| Buttons | ✅ Implemented | shadcn Button variants |
| Cards | ✅ Implemented | shadcn Card |
| Icons | ✅ Implemented | Lucide React |
| Colors | ✅ Implemented | CSS variables, oklch |
| Animations | ✅ Implemented | tw-animate-css |
| Empty States | ✅ Implemented | EmptyState component |
| Error Messages | 🟡 Partially | Some pages missing error boundaries |
| Loading States | 🟡 Partially | loading.tsx exists, Suspense missing |

### Phase 24: Code Quality

| Feature | Status | Notes |
|---------|--------|-------|
| Dead Code | ⚠ Needs review | Some unused imports |
| Duplicate Components | 🔴 Issues | Duplicate register schemas |
| Unused Files | ⚠ Needs review | transformations.ts empty |
| Placeholder Content | 🔴 Issues | Homepage testimonials, free-guide |
| Mock Data | ⚠ Needs review | Some static data |
| Console Logs | ⚠ Needs review | — |
| Folder Structure | ✅ Implemented | Clean architecture |
| Naming Conventions | ✅ Implemented | Consistent |
| Reusability | ✅ Implemented | Service layer, shared components |
| Type Safety | ✅ Implemented | TypeScript strict |
| Error Handling | 🟡 Partially | Some missing try/catch |

---

## CRITICAL BUGS

### 1. 🔴 Middleware NOT Active (proxy.ts)
**Severity:** CRITICAL
**File:** `proxy.ts`
**Issue:** `proxy.ts` exports a `proxy` function, but Next.js expects `middleware.ts` with a default export named `middleware`. The entire route protection system is INACTIVE. Any user can access `/admin`, `/coach`, `/client` routes without authentication.
**Fix:** Rename `proxy.ts` to `middleware.ts` and rename the export from `proxy` to `middleware`. Add `/verify-email` to PUBLIC_PREFIXES.

### 2. 🔴 Duplicate Register Schemas
**Severity:** HIGH
**Files:** `lib/validations.ts`, `server/validators/auth.schema.ts`
**Issue:** Two separate Zod schemas for registration. Client validates against one, server against another. They happen to be identical now but can silently diverge.
**Fix:** Remove `lib/validations.ts` and import from `server/validators/auth.schema.ts` in the register form.

### 3. 🔴 Free-Guide Form is Cosmetic Only
**Severity:** HIGH
**File:** `app/free-guide/page.tsx`
**Issue:** `handleSubmit` just sets `submitted = true`. No server action sends the guide email. Users think they signed up but never receive anything.
**Fix:** Create a server action to handle lead capture and email delivery.

### 4. 🟡 Wrong Notification Type in Subscription Approval
**Severity:** MEDIUM
**File:** `server/services/subscription.service.ts:234`
**Issue:** Uses `CHECK_IN_DUE` instead of a subscription-specific type.
**Fix:** Change to appropriate notification type.

### 5. 🟡 In-Memory Rate Limiting
**Severity:** MEDIUM
**File:** `server/utils/rate-limit.ts`
**Issue:** Uses `new Map()` — ineffective in serverless/multi-instance deployments.
**Fix:** Document limitation; consider Redis-based rate limiting for production.

### 6. 🟡 Stripe Webhook Upsert Key
**Severity:** MEDIUM
**File:** `app/api/webhooks/stripe/route.ts:116`
**Issue:** Uses `stripeCustomerId` as upsert key instead of `userId`. Could update wrong record for users with multiple subscriptions.
**Fix:** Use `userId` as unique key.

---

## MISSING FEATURES SUMMARY

### High Priority (Core Platform)
1. **Forgot/Reset Password** — No password recovery flow
2. **Middleware Route Protection** — Currently INACTIVE
3. **Habits Tracker** — No daily habit tracking (water, sleep, protein, etc.)
4. **Goals System** — No goal setting/tracking
5. **Achievements/Badges** — No gamification
6. **Favorites System** — No bookmarking content
7. **Global Search** — No cross-content search
8. **Notification UI** — No bell/badge in navigation
9. **Water Tracker** — No water intake logging
10. **Food/Nutrition Logging** — Static calculator only

### Medium Priority (UX Enhancement)
11. **Workout Calendar View** — No visual calendar
12. **Before/After Photo Comparison** — No comparison view
13. **Check-in Enhancements** — Missing mood, notes, photos
14. **Timer Sound Alerts** — No audio feedback
15. **Downloads/Export** — No PDF/download functionality
16. **Educational Resources** — No articles/videos section
17. **Community Features** — No social/feed
18. **Theme Toggle UI** — Dark mode CSS exists, no switch
19. **Unit Preferences** — No kg/lbs toggle in settings
20. **Notification Preferences** — Placeholder only

### Low Priority (Nice-to-Have)
21. **Account Deletion** — Not implemented
22. **Exercise Detail Page** — No individual exercise view
23. **Workout Duration Tracking** — No timer integration
24. **BMI Calculator** — Not implemented
25. **Strength PR Tracking** — Not implemented
26. **Message Search/History** — No search in messages
27. **Video Attachments in Chat** — Images only
28. **Coach Announcements** — No announcements system
29. **Offline Support** — No service worker
30. **Lazy Loading** — No dynamic imports for heavy components

---

## RECOMMENDED IMPLEMENTATION ORDER

### Phase A: Critical Fixes (Immediate)
1. Fix middleware (proxy.ts → middleware.ts)
2. Fix duplicate schemas
3. Fix free-guide server action
4. Fix notification type bug
5. Fix Stripe webhook upsert key

### Phase B: Core Missing Features (High Impact)
6. Forgot/Reset Password
7. Habits Tracker (new page + DB model)
8. Goals System (new page + DB model)
9. Achievements/Badges (new page + DB model)
10. Favorites System (new DB model)
11. Global Search
12. Notification Bell/Badge UI
13. Water Tracker

### Phase C: UX Enhancements (Medium Impact)
14. Workout Calendar View
15. Before/After Photo Comparison
16. Check-in Enhancements (mood, notes, photos)
17. Timer Sound Alerts
18. Downloads/Export
19. Educational Resources
20. Theme Toggle
21. Unit Preferences
22. Notification Preferences
