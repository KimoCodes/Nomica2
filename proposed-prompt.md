# NomiTips — Complete Product Transformation & Production-Ready Implementation Prompt

You are the lead software architect, senior full-stack engineer, UX/UI designer, fitness-product strategist, QA engineer, security engineer, and DevOps engineer responsible for transforming this existing NomiTips project into a polished, production-ready, innovative fitness coaching platform.

## IMPORTANT: READ AND UNDERSTAND THE EXISTING PROJECT FIRST

Before modifying anything:

1. Scan the ENTIRE repository.
2. Inspect all source files, components, pages, server actions, services, API routes, Prisma schema, authentication, payment logic, analytics, database queries, styling, environment configuration, and deployment configuration.
3. Understand how the current system works before changing it.
4. Do NOT blindly rewrite working functionality.
5. Preserve existing working features unless there is a clear technical or UX reason to improve them.
6. Reuse existing services, components, database models, validators, utilities, and design patterns wherever appropriate.
7. Avoid duplicate implementations.
8. Do not create unnecessary dependencies.
9. Do not remove existing functionality without replacing it with a better equivalent.
10. Maintain TypeScript type safety throughout.
11. Keep the application compatible with the existing stack.

The current platform is built around:

* Next.js 16
* React 19
* TypeScript
* Prisma
* Neon PostgreSQL
* NextAuth
* Stripe
* Cloudinary
* Socket.IO
* Resend/Brevo
* Zod
* Tailwind
* shadcn/Radix UI
* Recharts
* Pino
* Sentry

The existing project already contains client, coach, admin, authentication, workouts, programs, progress, habits, goals, check-ins, messaging, transformations, subscriptions, payments, analytics, media, and other functionality.

The goal is NOT to turn the project into a collection of random features.

The goal is to transform NomiTips into:

> "An adaptive fitness companion that learns from the user's journey and combines personalized workouts, habits, nutrition, recovery, progress tracking, and human coaching."

---

# PHASE 0 — FULL PROJECT AUDIT BEFORE CODING

Before implementation, create an internal implementation plan based on the actual repository.

Inspect:

* app/
* actions/
* components/
* constants/
* lib/
* server/
* prisma/
* types/
* authentication
* payment system
* analytics
* Socket.IO
* email system
* Cloudinary
* environment configuration
* deployment configuration
* package.json
* existing database migrations
* existing UI patterns

Identify:

* Existing functionality that can be reused
* Missing functionality
* Broken functionality
* Duplicate functionality
* Security vulnerabilities
* Performance bottlenecks
* Database gaps
* UX problems
* Accessibility problems
* Mobile problems
* Production blockers
* Technical debt
* Features that should be redesigned rather than duplicated

Do not begin by rewriting the entire application.

---

# PHASE 1 — PRODUCTION AND SECURITY FOUNDATION

Before implementing advanced features, fix all launch-blocking issues.

## 1. Secrets

The existing audit indicates that sensitive credentials may have been committed to `.env`.

Immediately:

* Remove secrets from source control where appropriate.
* Ensure `.env` is ignored.
* Create `.env.example`.
* Never expose secrets to client-side code.
* Never hard-code API keys.
* Do not print secrets in logs.
* Clearly document every required production environment variable.

IMPORTANT:

Do not invent real production credentials.

Use placeholders where credentials are required.

---

## 2. Authentication hardening

Improve authentication security.

Implement:

* Proper route protection
* Server-side authorization
* Middleware where appropriate
* Role-based protection
* Session validation
* Brute-force protection
* Persistent rate limiting
* Secure password reset
* Email verification
* Secure token expiration
* Session invalidation when appropriate
* Protection against privilege escalation

Review the current NextAuth configuration carefully before changing it.

Do not break:

* CLIENT
* COACH
* ADMIN

permissions.

---

# PHASE 2 — TESTING INFRASTRUCTURE

The current audit reports zero automated tests.

Create a proper testing architecture.

Implement:

## Unit tests

Test:

* Authentication
* Authorization
* Entitlements
* Subscription logic
* Program logic
* Workout calculations
* Progressive overload calculations
* Habit calculations
* Readiness calculations
* Consistency calculations
* Goal calculations
* Nutrition calculations
* Analytics calculations

## Integration tests

Test:

* API routes
* Server actions
* Database operations
* Stripe webhook processing
* Authentication
* Coach/client relationships
* Program assignment
* Workout completion
* Check-ins
* Payments
* Notifications

## E2E tests

At minimum:

1. Registration
2. Email verification
3. Login
4. Onboarding
5. Client dashboard
6. Program access
7. Workout completion
8. Progress logging
9. Habit logging
10. Check-in submission
11. Coach response
12. Subscription
13. Program purchase
14. Payment webhook
15. Logout

Do not claim functionality is complete unless tests pass.

---

# PHASE 3 — NomiTips PERSONAL FITNESS ENGINE

This is the most important product innovation.

Build a central fitness intelligence layer.

Create a service such as:

`personalization.service.ts`

or an equivalent architecture that fits the existing codebase.

The system should combine:

* Fitness goals
* Fitness level
* Age where appropriate
* Equipment availability
* Workout history
* Exercise performance
* Sets
* Reps
* Weight
* Workout completion
* Workout difficulty
* Missed workouts
* Sleep
* Habits
* Progress
* Check-ins
* Coach feedback
* Schedule
* Preferences
* Nutrition information where available

The system should produce useful recommendations.

Examples:

* Today's workout
* Workout intensity
* Exercise progression
* Exercise substitutions
* Recovery recommendations
* Habit recommendations
* Nutrition suggestions
* Missed-workout adjustments
* Weekly plan adjustments

The system should be deterministic and explainable where possible.

Do not make random recommendations.

Every recommendation should have a reason.

Example:

> "You completed your previous upper-body workout 3 days ago and completed all prescribed reps, so today's session increases the target slightly."

---

# PHASE 4 — ADAPTIVE WORKOUTS

Transform the existing workout system from static workout delivery into adaptive programming.

## Add:

### Progressive overload

Use historical performance.

Example:

Previous:

20kg × 10 × 3

Next recommendation:

22.5kg × 8–10 × 3

or another appropriate progression.

Do not blindly increase weights.

Consider:

* previous completion
* difficulty
* RPE/RIR
* missed reps
* fatigue
* recent performance

---

## RPE / RIR

Allow users to report:

* RPE 1–10
* Reps in reserve

Use this information when generating recommendations.

---

## Workout difficulty

After workouts:

* Very Easy
* Easy
* Moderate
* Hard
* Very Hard

Use this feedback to adjust future recommendations.

---

# PHASE 5 — EXERCISE SUBSTITUTION ENGINE

Allow users to replace exercises.

For every exercise, support alternatives based on:

* Same muscle group
* Similar movement pattern
* Equipment
* Difficulty
* Home/gym
* Beginner/intermediate/advanced
* Low-impact
* Chair/accessibility options

Example:

Barbell Squat →

* Goblet Squat
* Bodyweight Squat
* Leg Press
* Bulgarian Split Squat

The replacement must preserve the workout's intent as much as possible.

---

# PHASE 6 — "I ONLY HAVE X MINUTES"

Add a smart workout duration feature.

Users should be able to choose:

* 10 minutes
* 15 minutes
* 20 minutes
* 30 minutes
* 45 minutes
* 60+ minutes

NomiTips should intelligently modify the planned session.

Example:

Original:

45 minutes

User chooses:

20 minutes

Generate:

* shortened warm-up
* highest-priority exercises
* appropriate sets
* condensed rest
* cooldown if appropriate

Do not simply cut exercises randomly.

---

# PHASE 7 — MISSED WORKOUT RECOVERY

Do not treat missed workouts as failure.

When a workout is missed, show:

> "Don't worry. Let's adjust your week."

Options:

* Move workout
* Combine workouts
* Shorten workout
* Skip and continue
* Add recovery day

Respect recovery and avoid excessive training volume.

---

# PHASE 8 — FITNESS CALENDAR

Build a comprehensive fitness calendar.

Include:

* Workouts
* Rest days
* Recovery sessions
* Habits
* Check-ins
* Nutrition goals
* Challenges
* Coach assignments

Allow:

* Rescheduling
* Drag/drop where appropriate
* Skip
* Repeat
* Move workout
* Add custom workout
* Add recovery day

Make the calendar mobile-friendly.

---

# PHASE 9 — READINESS SCORE

Create a daily readiness system.

Example:

## Today's Readiness

78/100

Use available information such as:

* Sleep
* Recent training
* Training intensity
* Recovery
* Self-reported energy
* Recent workout difficulty
* Habit adherence

Then recommend:

* High-intensity workout
* Moderate workout
* Recovery
* Mobility
* Rest

Do NOT present this as medical diagnosis.

Clearly label it as a fitness/recovery recommendation.

---

# PHASE 10 — RECOVERY INTELLIGENCE

Use existing sleep and habit tracking.

Provide insights such as:

> "Your sleep has been below your recent average. Consider a lighter session today."

Track:

* Sleep
* Hydration
* Training frequency
* Workout intensity
* Rest days
* Self-reported energy
* Recovery

Do not make medical claims.

---

# PHASE 11 — PERSONAL RECORDS

Add:

## Personal Records

Track:

* Maximum weight
* Maximum reps
* Estimated strength
* Longest duration
* Best time
* Most consistent week
* Most workouts
* Longest streak

Display:

> 🎉 New Personal Record

Create historical charts.

---

# PHASE 12 — PERFORMANCE ANALYTICS

Expand existing progress analytics.

For each exercise, show:

* Weight progression
* Rep progression
* Volume progression
* Frequency
* PRs
* Performance trends

Example:

Bench Press:

20kg → 25kg → 30kg → 35kg

Avoid misleading percentages where the underlying data doesn't support them.

---

# PHASE 13 — TRANSFORMATION JOURNEY

Improve the existing transformation functionality.

Instead of simply:

Before → After

create:

## My 90-Day Journey

Include:

* Starting point
* Current point
* Weight trend
* Measurements
* Strength progression
* Workouts completed
* Consistency
* Habit adherence
* Goals
* Milestones
* Coach feedback
* Progress photos
* Personal records

Create a beautiful timeline.

Make transformation data private by default.

Require explicit consent before public publication.

---

# PHASE 14 — CONSISTENCY SCORE

Create a meaningful consistency metric.

Example:

## Consistency Score

86%

Break down:

* Workout adherence
* Habit adherence
* Check-in adherence
* Nutrition adherence where available
* Goal progress

Compare:

* This week
* Last week
* This month

Avoid using consistency as a shame mechanism.

The tone should be encouraging.

---

# PHASE 15 — STREAKS

Implement:

* Workout streak
* Habit streak
* Check-in streak
* Challenge streak
* Overall consistency streak

Use streak protection carefully.

Do not make users feel punished for missing one day.

---

# PHASE 16 — CHALLENGES

Create a challenge system.

Examples:

### 7-Day Water Challenge

### 30-Day Workout Challenge

### 100K Steps Challenge

### 30-Day Consistency Challenge

Support:

* Challenge creation
* Start/end dates
* Progress
* Participants
* Leaderboards
* Badges
* Completion
* Notifications

Make challenges configurable by admins/coaches.

---

# PHASE 17 — GAMIFICATION

Create tasteful gamification.

Introduce:

* NomiPoints
* Levels
* Badges
* Milestones
* Achievements

Users earn points for meaningful actions:

* Workout completion
* Habit completion
* Check-ins
* Challenges
* Progress logging
* Community participation

Do NOT reward spam.

Do NOT make the application childish.

Gamification should support consistency.

---

# PHASE 18 — COMMUNITY

Build a fitness-focused community layer.

Users should be able to:

* Share progress
* Share achievements
* Ask questions
* Share recipes
* Join challenges
* Encourage others
* Celebrate milestones

Implement:

* Moderation
* Reporting
* Privacy controls
* Blocking
* Content visibility
* Admin moderation tools

Do not turn NomiTips into a generic social media clone.

---

# PHASE 19 — COACH EARLY-WARNING SYSTEM

Improve the coach dashboard.

Instead of only showing client counts, create:

## Clients Needing Attention

Examples:

🔴 No workout for 6 days

🟠 Missed 2 check-ins

🟡 Sleep trend declining

🟢 Strong improvement

Create explainable alerts.

Coaches should be able to:

* Open client
* Message client
* Review history
* Adjust program
* Add note
* Dismiss alert

---

# PHASE 20 — COACH INTELLIGENCE DASHBOARD

Show:

* Active clients
* Client adherence
* Check-in response rate
* Client progress
* Client retention
* Average consistency
* Clients at risk
* Top-performing clients
* Recent transformations

Keep data useful and actionable.

---

# PHASE 21 — AI COACH ASSISTANT

Implement AI only where it provides genuine value.

Create a NomiTips AI assistant that can use authorized user data such as:

* Goals
* Workout history
* Program
* Habits
* Progress
* Check-ins
* Coach instructions

Example questions:

> "Why am I not progressing?"

> "What should I do today?"

> "I only have 20 minutes."

> "Can I replace today's exercise?"

> "What should I eat tonight?"

> "Why is my squat stuck?"

The AI should not pretend to be a doctor.

It should not diagnose injuries or diseases.

For medical/injury concerns, recommend professional medical advice.

The AI should assist the human coach, not replace them.

---

# PHASE 22 — HUMAN COACH + AI MODEL

Establish clear authority:

AI = assistant

Human coach = authoritative fitness professional within the platform

Allow coaches to:

* Review AI suggestions
* Approve recommendations
* Override recommendations
* Add instructions
* Lock certain program elements

Never let AI silently override explicit coach instructions.

---

# PHASE 23 — VIDEO EXERCISE FEEDBACK

Create infrastructure for optional exercise video uploads.

Potential workflow:

User uploads exercise video

↓

AI provides preliminary movement feedback where technically feasible

↓

Coach can review

↓

Coach can provide final feedback

Do not present AI analysis as medical diagnosis.

Do not claim perfect biomechanical accuracy.

Include privacy controls and deletion.

---

# PHASE 24 — NUTRITION SYSTEM

Expand the existing nutrition feature substantially.

Build:

* Meal plans
* Recipes
* Meal scheduling
* Protein goals
* Water goals
* Nutrition preferences
* Dietary preferences
* Shopping lists
* Meal substitutions
* Favorite meals

Make nutrition recommendations configurable.

Avoid dangerous dieting recommendations.

Do not encourage extreme calorie restriction.

---

# PHASE 25 — RWANDA / LOCAL NUTRITION

Make NomiTips regionally relevant.

Include foods commonly available in Rwanda and East Africa.

Examples may include:

* Beans
* Sweet potatoes
* Irish potatoes
* Isombe
* Eggs
* Milk
* Avocado
* Beef
* Chicken
* Fish
* Rice
* Fruits

Allow:

> "Build my meal plan using foods available locally."

Do not stereotype users.

Allow users to customize food availability.

---

# PHASE 26 — SMART FOOD SUBSTITUTION

If a user doesn't have an ingredient:

> "I don't have chicken."

Provide suitable alternatives based on nutritional purpose.

Do not make false claims about exact nutritional equivalence.

Show approximate values where available.

---

# PHASE 27 — BEGINNER MODE

Create a simplified experience for new users.

Instead of overwhelming them with every feature:

## Today's Focus

1. Complete today's workout
2. Drink water
3. Walk
4. Sleep well

Gradually introduce advanced functionality.

Allow users to switch between:

* Beginner
* Standard
* Advanced

---

# PHASE 28 — ACCESSIBILITY

Every major exercise should support alternatives where possible:

* Chair
* Low-impact
* No equipment
* Home
* Gym
* Beginner
* Advanced

Improve:

* Keyboard navigation
* Screen-reader labels
* Color contrast
* Focus states
* Touch targets
* Form accessibility
* Reduced motion

---

# PHASE 29 — NO-EQUIPMENT MODE

Add:

## "I have no equipment"

NomiTips should recommend appropriate bodyweight alternatives.

Allow equipment profiles:

* None
* Dumbbells
* Resistance bands
* Barbell
* Machines
* Full gym
* Custom equipment

---

# PHASE 30 — OFFLINE / LOW-CONNECTIVITY EXPERIENCE

Design for users who may have unreliable internet.

Where technically appropriate:

* Cache today's workout
* Cache exercise instructions
* Allow workout logging offline
* Queue actions
* Synchronize when online

Clearly handle synchronization conflicts.

Do not duplicate workout records.

---

# PHASE 31 — SMART EXERCISE SEARCH

Improve exercise discovery.

Filters:

* Muscle
* Equipment
* Difficulty
* Goal
* Duration
* Location
* Low-impact
* Accessibility

Search should be fast and mobile-friendly.

---

# PHASE 32 — SURPRISE ME

Add:

## 🎲 Surprise Me

User chooses:

* Duration
* Equipment
* Goal
* Difficulty
* Location

NomiTips recommends an appropriate workout.

Do not choose randomly from incompatible exercises.

---

# PHASE 33 — WORKOUT NOTES

Allow users to write notes such as:

> "Felt strong today."

> "Gym was crowded."

> "Used 15kg instead of 20kg."

> "My energy was low."

Allow coaches to see these notes according to permissions.

---

# PHASE 34 — REFERRAL SYSTEM

Create:

## Invite a Friend

Potential rewards:

* Free premium days
* Discount
* Points

Make rewards configurable.

Track:

* Referral code
* Referral source
* Signup
* Conversion
* Reward

Prevent abuse and self-referrals.

---

# PHASE 35 — COACH MARKETPLACE FOUNDATION

Prepare the architecture for:

## Find a Coach

Filters:

* Goal
* Specialty
* Price
* Language
* Experience
* Rating
* Availability
* Location
* Online/in-person

Do not necessarily build every booking/payment feature immediately.

Create the architecture so it can be expanded safely.

---

# PHASE 36 — COACH REVIEWS

Allow clients to review coaches after appropriate interactions.

Include:

* Rating
* Written review
* Moderation
* Coach response
* Review eligibility rules

Prevent fake reviews and repeated reviews.

---

# PHASE 37 — LIVE COACHING FOUNDATION

Prepare functionality for:

* Live workouts
* Group sessions
* Q&A
* Nutrition sessions
* Mobility sessions

Reuse the existing real-time infrastructure where appropriate.

Do not build a complex video platform from scratch unless necessary.

---

# PHASE 38 — WHATSAPP / EXTERNAL NOTIFICATION ARCHITECTURE

Prepare the notification architecture for future WhatsApp integration.

Possible notifications:

> Good morning 👋 Your workout is ready.

> 🔥 You're on a 6-day streak.

> ⚠️ Your coach has responded to your check-in.

Keep external messaging opt-in.

Do not spam users.

---

# PHASE 39 — ADVANCED ADMIN ANALYTICS

Improve existing page visit/activity analytics.

Do not only display page views.

Create:

## Acquisition Funnel

Visitors

↓

Quiz completions

↓

Registrations

↓

Onboarding completions

↓

First workout

↓

Trial

↓

Purchase

↓

Retention

Track conversion rates.

---

## Engagement Analytics

Track:

* DAU
* WAU
* MAU
* Workout frequency
* Habit adherence
* Check-in rate
* Session duration
* Retention
* Churn

---

## Revenue Analytics

Track:

* Revenue
* MRR
* Purchases
* Subscription conversions
* Trial conversions
* Churn
* Refunds
* ARPU where meaningful

---

## Fitness Analytics

Track:

* Workouts completed
* Average adherence
* Program completion
* Goal progress
* Challenge participation

---

# PHASE 40 — AT-RISK USER SYSTEM

Automatically identify users who may need attention.

Examples:

### 🔴 At Risk

* No login
* No workout
* Missed check-ins
* Subscription ending
* Low engagement

### 🟢 Healthy

* Regular workouts
* Active habits
* Coach interaction

### 🔵 Highly Engaged

* High consistency
* Program completion
* Community activity
* Progress milestones

Give coaches/admins actionable next steps.

---

# PHASE 41 — PRIVACY AND DATA CONTROL

Because NomiTips handles fitness data, implement:

* Account deletion
* Data export
* Data retention rules
* Analytics anonymization where appropriate
* Cookie consent
* Privacy settings
* Progress photo deletion
* Transformation publication consent
* Clear data processing explanations

Users must control their public/private transformation content.

---

# PHASE 42 — PAYMENT HARDENING

Improve Stripe integration.

Implement:

* Real production Price IDs through environment variables
* Verified webhook secret
* Idempotency
* Duplicate-event protection
* Refund synchronization
* Failed payment handling
* Subscription lifecycle synchronization
* Proper webhook event logging

Never hard-code production payment credentials.

---

# PHASE 43 — RELIABILITY

External services should not cause catastrophic application failures.

Add appropriate:

* Retry logic
* Exponential backoff
* Timeouts
* Circuit breaker where justified
* Graceful degradation

Services include:

* Stripe
* Cloudinary
* Email
* AI provider
* External APIs

Do not blindly retry non-idempotent operations.

---

# PHASE 44 — PERFORMANCE

Optimize:

* Heavy analytics components
* Charts
* Socket.IO client
* Images
* Exercise media
* Database queries
* Server actions
* API routes

Use:

* Dynamic imports
* Code splitting
* Proper caching
* Pagination
* Database indexes
* Lazy loading

Do not optimize prematurely.

Measure before and after.

---

# PHASE 45 — LOADING AND ERROR UX

Implement route-level:

* loading.tsx
* Suspense boundaries
* error.tsx

Provide graceful UI for:

* Network failure
* Payment failure
* Upload failure
* AI failure
* Database failure
* Missing data

Never show raw stack traces to users.

---

# PHASE 46 — DESIGN SYSTEM

The application should feel like one cohesive product.

Create/reuse a consistent design system for:

* Buttons
* Cards
* Forms
* Modals
* Tables
* Charts
* Badges
* Empty states
* Loading states
* Notifications
* Navigation
* Mobile layouts

The visual style should feel:

* Modern
* Premium
* Energetic
* Human
* Fitness-oriented
* Trustworthy
* Clean

Do not overuse animations.

Do not make it look like a generic AI-generated SaaS dashboard.

---

# PHASE 47 — CLIENT DASHBOARD REDESIGN

The client dashboard should answer:

### What should I do today?

### How am I progressing?

### How consistent am I?

### What does my coach want me to know?

### What should I improve?

Example structure:

---

## Good morning 👋

### Today's Readiness

78/100

### Today's Workout

Upper Body — 38 min

[Start Workout]

### Your Progress

Consistency 86%

🔥 12-day streak

### Your Next Milestone

3 workouts away

### Coach Message

"Great progress this week!"

---

# PHASE 48 — COACH DASHBOARD REDESIGN

Answer:

### Which clients need me?

### Who is progressing?

### Who is struggling?

### What should I do today?

Example:

## Coach Dashboard

42 Clients

38 Active

### Needs Attention

🔴 3 clients

🟠 5 clients

### Recent Progress

5 PRs

### Check-ins

12 awaiting response

### Client Retention

91%

---

# PHASE 49 — ADMIN DASHBOARD REDESIGN

Answer:

### Is the business healthy?

Show:

* Revenue
* Users
* Active subscribers
* Conversion
* Retention
* Churn
* Engagement
* Coaches
* Programs
* Top products
* Acquisition funnel
* System health

Make analytics meaningful rather than decorative.

---

# PHASE 50 — MOBILE-FIRST EXPERIENCE

Fitness users will often use phones during workouts.

Ensure:

* Large touch targets
* Easy workout logging
* Sticky workout controls
* Minimal typing
* Fast page transitions
* Full-screen workout mode
* Easy timer
* Easy exercise substitution
* Offline support where available

Workout mode should feel like a dedicated mobile fitness application.

---

# PHASE 51 — DATA MODEL REVIEW

Review the Prisma schema before adding models.

Reuse existing models where possible.

Only create new models when necessary.

Potential entities may include:

* Achievement
* Challenge
* ChallengeParticipant
* PersonalRecord
* WorkoutFeedback
* ExerciseSubstitution
* ReadinessScore
* Recommendation
* CommunityPost
* CommunityComment
* CommunityReaction
* CoachAlert
* Referral
* ReferralReward
* Meal
* Recipe
* MealPlan
* NutritionLog

But DO NOT blindly add all of these.

First determine whether existing models can support the requirement.

Maintain:

* Foreign keys
* Indexes
* Unique constraints
* Cascades
* Data integrity

Create migrations safely.

Never use destructive database commands in production.

---

# PHASE 52 — NOTIFICATION SYSTEM

Expand the notification system intelligently.

Notifications should include:

* Workout reminder
* Workout completed
* New PR
* Streak milestone
* Coach message
* Check-in response
* Challenge update
* Subscription event
* Payment event
* Recovery recommendation
* Goal milestone

Allow users to control notification preferences.

---

# PHASE 53 — CONTENT STRATEGY

Create space for educational content:

* Exercise education
* Nutrition education
* Recovery
* Beginner guides
* Fitness terminology
* Technique tips
* Motivation
* Coach articles

Make the content useful rather than SEO spam.

---

# PHASE 54 — PRODUCT PRINCIPLES

Throughout implementation, follow these principles:

### 1. Personalization over quantity

### 2. Consistency over punishment

### 3. Progress over perfection

### 4. Human coaching + technology

### 5. Accessibility

### 6. Local relevance

### 7. Privacy by default

### 8. Explainable recommendations

### 9. Mobile-first fitness experience

### 10. Production reliability

---

# PHASE 55 — IMPORTANT: DO NOT OVERENGINEER

Do not:

* Rewrite the entire codebase unnecessarily
* Add dependencies without justification
* Create duplicate services
* Create duplicate database models
* Build fake AI functionality
* Add meaningless dashboards
* Add unnecessary animations
* Add features that don't improve user outcomes
* Break existing functionality

Every new feature should answer:

> "What user problem does this solve?"

---

# PHASE 56 — IMPLEMENTATION ORDER

Implement in this order:

## Stage 1 — Security & Production

* Secrets
* Authentication
* Authorization
* Rate limiting
* Stripe
* Sentry
* Privacy
* Environment configuration

## Stage 2 — Testing

* Test framework
* Unit tests
* Integration tests
* E2E tests

## Stage 3 — Core Fitness Intelligence

* Personalization engine
* Progressive overload
* RPE/RIR
* Adaptive difficulty
* Workout substitutions
* Duration adjustment
* Missed workout recovery
* Readiness
* Recovery

## Stage 4 — User Experience

* Calendar
* PRs
* Consistency
* Streaks
* Journey timeline
* Beginner mode
* Accessibility
* No-equipment mode

## Stage 5 — Nutrition

* Meal planning
* Recipes
* Local food
* Substitutions
* Nutrition tracking

## Stage 6 — Engagement

* Challenges
* Gamification
* Community
* Notifications

## Stage 7 — Coaching

* Coach alerts
* Coach intelligence
* Coach reviews
* AI assistant
* Human coach approval

## Stage 8 — Growth

* Referrals
* Coach marketplace foundation
* Live coaching foundation
* External notification architecture

## Stage 9 — Optimization

* Performance
* Offline support
* Mobile optimization
* Analytics
* SEO
* Accessibility
* Monitoring

---

# PHASE 57 — UX QUALITY STANDARD

Do not implement features as bare CRUD pages.

Every feature must have:

* Empty state
* Loading state
* Error state
* Success state
* Mobile layout
* Desktop layout
* Validation
* Permission checks
* Helpful feedback
* Accessible controls

Example:

Bad:

> "No workouts."

Good:

> "Your week is clear 🎯
> Your next workout is waiting for you."

[View Workout]

---

# PHASE 58 — SECURITY STANDARD

For every new feature verify:

* Authentication
* Authorization
* Input validation
* Rate limiting
* Ownership checks
* SQL/Prisma safety
* File upload restrictions
* Content moderation where applicable
* CSRF considerations
* XSS protection
* Sensitive-data handling
* Logging without secrets

Never trust client-provided:

* user IDs
* role
* subscription status
* permissions
* prices
* ownership
* coach relationships

Verify everything server-side.

---

# PHASE 59 — DATABASE PERFORMANCE

For every new database query:

Check:

* Index availability
* N+1 risks
* Pagination
* Select only required fields
* Relation loading
* Query frequency
* Caching opportunities

Do not fetch entire tables unnecessarily.

---

# PHASE 60 — FINAL QA

After implementation:

Run:

* TypeScript checks
* ESLint
* Unit tests
* Integration tests
* E2E tests
* Production build
* Database migration validation

Then manually verify:

### Client

* Registration
* Login
* Onboarding
* Workout
* Workout logging
* Exercise replacement
* Progress
* Habits
* Nutrition
* Goals
* Check-ins
* Messaging
* Challenges
* Notifications
* Subscription

### Coach

* Login
* Client management
* Programs
* Exercises
* Check-ins
* Messages
* Alerts
* Progress
* Program adaptation

### Admin

* Users
* Coaches
* Payments
* Programs
* Subscriptions
* Analytics
* Challenges
* Content
* Moderation

---

# PHASE 61 — FINAL PRODUCTION AUDIT

Before declaring the project complete, inspect the entire project again.

Produce a final report containing:

## 1. Implemented Features

List everything actually implemented.

## 2. Existing Features Improved

List features that were redesigned or enhanced.

## 3. Database Changes

List every new/changed model, field, index and migration.

## 4. API Changes

List new and modified endpoints/server actions.

## 5. Security Improvements

List all security changes.

## 6. Testing

Report:

* Unit test count
* Integration test count
* E2E test count
* Passing tests
* Failing tests

Never claim tests pass if they don't.

## 7. Performance

Report major improvements and any remaining bottlenecks.

## 8. Remaining Issues

Clearly separate:

### CRITICAL

Must fix before production.

### HIGH

Should fix before launch.

### MEDIUM

Can be addressed shortly after launch.

### LOW

Future improvements.

## 9. Production Readiness Score

Score:

* Architecture
* Security
* Testing
* UX
* Accessibility
* Performance
* Reliability
* Payments
* Privacy
* Analytics
* Business functionality
* Fitness intelligence

Then provide an overall score.

---

# FINAL PRODUCT VISION

When you finish, NomiTips should no longer feel like:

> "A website where users buy fitness programs."

It should feel like:

> **"A personal fitness ecosystem that understands my goals, adapts my workouts, tracks my progress, helps me build healthy habits, connects me with a coach, and keeps me motivated."**

The most important experience should be:

**User opens NomiTips → NomiTips understands where they are in their fitness journey → NomiTips tells them what matters today → user takes action → NomiTips learns from the result → the next recommendation becomes better.**

That feedback loop is the core innovation.

Build the product around this loop:

**GOAL → PLAN → ACTION → DATA → INSIGHT → ADAPTATION → PROGRESS → MOTIVATION → REPEAT**

Do not stop at implementing individual features.

Make the entire product work together as one coherent fitness experience.
