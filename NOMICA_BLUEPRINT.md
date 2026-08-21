# NOMICA — World-Class Digital Storefront Blueprint

> Premium Feminine Transformation Fitness Brand
> Contact: noella.bahatsi@tstech.com

---

## Table of Contents

1. [Brand Identity & CRO Strategy](#1-brand-identity--cro-strategy)
2. [Internal Media System Architecture](#2-internal-media-system-architecture)
3. [Page-by-Page Build — Wireframes & Copy](#3-page-by-page-build)
4. [Product Catalog Architecture](#4-product-catalog-architecture)
5. [Premium Bundling & Upsell System](#5-premium-bundling--upsell-system)
6. [NOMICA Sculpt Club Membership](#6-nomica-sculpt-club-membership)
7. [Transformation & Social Proof System](#7-transformation--social-proof-system)
8. [Lead Magnet + Quiz Onboarding Flow](#8-lead-magnet--quiz-onboarding-flow)
9. [Objection Handling + FAQ + Footer](#9-objection-handling--faq--footer)
10. [Technical Implementation Summary](#10-technical-implementation-summary)

---

## 1. Brand Identity & CRO Strategy

### Brand Voice

| Attribute | Description |
|-----------|-------------|
| **Tone** | Confident, warm, empowering — like a best friend who happens to be a elite coach |
| **Language** | Feminine-forward, body-positive, avoids "shredding" or aggressive gym bro language |
| **Promise** | Structured training + emotional transformation = unshakable confidence |
| **Differentiator** | Not another workout PDF. This is a sculpting system backed by progressive overload science |

### Brand Keywords

`sculpt` · `confidence` · `glutes` · `structure` · `transformation` · `feminine strength` · `gym confidence` · `progressive overload` · `body sculpting` · `elite coaching`

### CRO Principles Applied Throughout

| Principle | Implementation |
|-----------|----------------|
| **One CTA per viewport** | Every scroll section has exactly one primary action |
| **Value anchoring** | Price always shown next to "value" or "what you'd pay separately" |
| **Loss aversion** | "Don't wait" framing over "you should" framing |
| **Social proof proximity** | Testimonials placed within 200px of every CTA button |
| **Friction reduction** | Quiz funnel captures email before asking for payment |
| **Commitment escalation** | Free guide → Quiz → Low-ticket → Membership funnel ladder |

### Color System. Blackelephant@1234567890

```
Primary:        oklch(0.54 0.18 155)  — NOMICA Green (energy, growth, vitality)
Secondary:      oklch(0.85 0.02 330)  — Soft Rose (feminine warmth)
Accent:         oklch(0.75 0.15 45)   — Golden Hour (premium, aspiration)
Background:     oklch(0.99 0.005 100) — Warm White
Surface:        oklch(0.97 0.01 100)  — Cream
Text Primary:   oklch(0.15 0.01 100)  — Rich Black
Text Secondary: oklch(0.50 0.01 100)  — Warm Gray
```

### Typography

```
Headings:    "Geist" — Modern, clean, premium feel
Body:        "Geist" — Consistent, readable at all sizes
Accent:      "Geist Mono" — For stats, numbers, metrics
```

---

## 2. Internal Media System Architecture

### 2.1 Database Schema (Prisma)

```prisma
model Media {
  id            String   @id @default(cuid())
  title         String
  description   String?
  type          MediaType
  url           String
  thumbnailUrl  String?
  fileSize      Int      // bytes
  mimeType      String   // "video/mp4", "image/jpeg", etc.
  duration      Int?     // seconds, for videos
  width         Int?     // pixels
  height        Int?     // pixels
  uploadedById  String
  uploadedBy    User     @relation(fields: [uploadedById], references: [id])
  
  // Associations
  programId     String?
  program       Program? @relation(fields: [programId], references: [id])
  weekId        String?
  week          Week?    @relation(fields: [weekId], references: [id])
  programDayId  String?
  programDay    ProgramDay? @relation(fields: [programDayId], references: [id])
  
  // Tags
  tags          MediaTag[]
  
  // Client progress
  progressLogs  ProgressLog[]
  
  // Visibility
  visibility    MediaVisibility @default(COACH_ONLY)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([type])
  @@index([uploadedById])
  @@index([programId])
}

enum MediaType {
  WORKOUT_VIDEO
  EXERCISE_DEMO
  TRAINING_IMAGE
  TRANSFORMATION
  PROGRESS_PHOTO
  PROGRESS_VIDEO
  HERO_REEL
  PRODUCT_IMAGE
  QUIZ_MEDIA
}

enum MediaVisibility {
  PUBLIC
  COACH_ONLY
  CLIENT_ONLY
  TEAM_ONLY
}

model MediaTag {
  id        String @id @default(cuid())
  mediaId   String
  media     Media  @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  tag       String // "glutes", "beginner", "HIIT", "form-correction"
  
  @@unique([mediaId, tag])
  @@index([tag])
}

model ProgressLog {
  id            String   @id @default(cuid())
  clientId      String
  client        User     @relation(fields: [clientId], references: [id])
  coachId       String?
  coach         User?    @relation(fields: [coachId], references: [id])
  
  type          ProgressLogType
  title         String?
  description   String?
  
  // Metrics
  weight        Float?   // kg
  waistCm       Float?
  hipCm         Float?
  gluteCm       Float?
  thighCm       Float?
  
  // Media
  mediaId       String?
  media         Media?   @relation(fields: [mediaId], references: [id])
  photos        ProgressPhoto[]
  
  // Coach feedback
  coachComment  String?
  coachRating   Int?     // 1-5
  commentedAt   DateTime?
  
  // Visibility
  visibility    MediaVisibility @default(COACH_ONLY)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([clientId])
  @@index([coachId])
  @@index([type])
  @@index([createdAt])
}

model ProgressPhoto {
  id            String   @id @default(cuid())
  logId         String
  log           ProgressLog @relation(fields: [logId], references: [id], onDelete: Cascade)
  mediaId       String
  media         Media    @relation(fields: [mediaId], references: [id])
  angle         PhotoAngle
  
  @@unique([logId, mediaId])
}

enum ProgressLogType {
  PROGRESS_PHOTO
  FORM_CHECK
  WEEKLY_UPDATE
  MEASUREMENT
  MILESTONE
  COACH_FEEDBACK
}

enum PhotoAngle {
  FRONT
  SIDE
  BACK
  THREE_QUARTER
}
```

### 2.2 File Storage Strategy

```
Storage Layer: Cloudinary (or S3-compatible)
├── media/
│   ├── coach-uploads/
│   │   ├── {coachId}/
│   │   │   ├── workout-videos/
│   │   │   ├── exercise-demos/
│   │   │   └── training-images/
│   ├── client-progress/
│   │   ├── {clientId}/
│   │   │   ├── progress-photos/
│   │   │   ├── form-checks/
│   │   │   └── weekly-updates/
│   ├── products/
│   │   ├── {productId}/
│   │   │   ├── previews/
│   │   │   └── thumbnails/
│   └── site/
│       ├── hero-reel/
│       └── quiz-media/
```

### 2.3 Upload API Routes

```
POST   /api/media/upload          — General upload (coach)
POST   /api/media/progress        — Client progress upload
GET    /api/media                 — List/search media
GET    /api/media/[id]            — Get single media item
PATCH  /api/media/[id]            — Update metadata/tags
DELETE /api/media/[id]            — Delete media
GET    /api/media/tags            — List all tags
GET    /api/client/[id]/progress  — Client progress timeline
```

### 2.4 Coach Media Library UI

```
┌─────────────────────────────────────────────────────────┐
│  MEDIA LIBRARY                              [+ Upload]  │
├─────────────────────────────────────────────────────────┤
│  Filter: [All ▾] [Videos ▾] [Images ▾] [Tags ▾]       │
│  Search: [________________________] 🔍                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 🎬   │ │ 🎬   │ │ 📷   │ │ 🎬   │ │ 📷   │         │
│  │ MP4  │ │ MP4  │ │ JPG  │ │ MOV  │ │ JPG  │         │
│  │ 2:34 │ │ 1:45 │ │ —    │ │ 3:12 │ │ —    │         │
│  │      │ │      │ │      │ │      │ │      │         │
│  │Glute │ │HIIT  │ │Form  │ │Squat │ │Progr │         │
│  │Bridge│ │Circuit│ │Check │ │Demo  │ │ess   │         │
│  │#glute│ │#hiit │ │#form │ │#legs │ │#prog │         │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                         │
│  Tags: [glutes] [beginner] [HIIT] [form] [+ Add]       │
└─────────────────────────────────────────────────────────┘
```

### 2.5 Client Progress Timeline UI

```
┌─────────────────────────────────────────────────────────┐
│  MY TRANSFORMATION TIMELINE                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Week 12 — Dec 2024                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 Measurements                                │   │
│  │ Waist: 28" (-3")  Hips: 40" (+2")  Weight: 132 │   │
│  │                                                 │   │
│  │ 📷 Progress Photos                    [View 3]  │   │
│  │ [Front] [Side] [Back]                           │   │
│  │                                                 │   │
│  │ 💬 Coach Noella: "Incredible glute development! │   │
│  │    Your form on hip thrusts has improved 100%.  │   │
│  │    Let's push heavier next week."               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Week 8 — Nov 2024                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 Measurements                                │   │
│  │ Waist: 30" (-1")  Hips: 38" (+1")  Weight: 135 │   │
│  │                                                 │   │
│  │ 🎬 Form Check Video                    [Play]   │   │
│  │ Squat depth check — coach approved ✓            │   │
│  │                                                 │   │
│  │ 💬 Coach Noella: "Great depth! Focus on         │   │
│  │    squeezing at the top."                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ─────── [Upload New Progress] ───────                 │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Page-by-Page Build

### 3.1 Homepage — Full Wireframe & Copy

---

#### SECTION 1: HERO (Above the Fold)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────────────┐ │
│  │                     │   │                             │ │
│  │   [INTERNAL VIDEO   │   │  BUILT FOR WOMEN WHO        │ │
│  │    REEL — AUTOPLAY  │   │  WANT RESULTS, NOT          │ │
│  │    LOOP — 5-8 SEC   │   │  EXCUSES                    │ │
│  │    COMPRESSED]      │   │                             │ │
│  │                     │   │  Glutes · Legs · Fat Burn   │ │
│  │                     │   │                             │ │
│  │                     │   │  Structured programs that    │ │
│  │                     │   │  actually work. No random    │ │
│  │                     │   │  workouts. No guessing.      │ │
│  │                     │   │  Just results.               │ │
│  │                     │   │                             │ │
│  └─────────────────────┘   │  ┌───────────────────────┐  │ │
│                            │  │  START MY TRANSFORMATION│  │ │
│                            │  └───────────────────────┘  │ │
│                            │                             │ │
│                            │  or take the 2-min quiz →   │ │
│                            │                             │ │
│                            │  ★★★★★ 2,400+ women transformed │
│                            └─────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Headline:**
```
Stop Scrolling. Start Sculpting.
```

**Subheadline:**
```
The only fitness platform built around progressive overload science,
glute-focused programming, and the confidence you deserve.

No random workouts. No guessing. Just a clear path to the body you've been visualization.
```

**Primary CTA:**
```
Start My Transformation →
```

**Secondary CTA:**
```
Take the 2-Minute Coach Match Quiz
```

**Trust Bar (below hero):**
```
★★★★★ 4.9/5 from 2,400+ women  ·  12,000+ programs completed  ·  98% would recommend
```

---

#### SECTION 2: PROBLEM / AGITATION

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              SOUND FAMILIAR?                                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 😩           │  │ 😤           │  │ 😔           │     │
│  │              │  │              │  │              │     │
│  │ "I work out  │  │ "I see other │  │ "I don't     │     │
│  │  but nothing │  │  women       │  │  know what   │     │
│  │  changes"    │  │  getting     │  │  to do in    │     │
│  │              │  │  results and  │  │  the gym"    │     │
│  │              │  │  I'm stuck"  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 😤           │  │ 😩           │  │ 🤷           │     │
│  │              │  │              │  │              │     │
│  │ "I've tried  │  │ "I'm scared  │  │ "I don't     │     │
│  │  so many     │  │  of getting  │  │  have time   │     │
│  │  programs    │  │  bulky"      │  │  for this"   │     │
│  │  that don't  │  │              │  │              │     │
│  │  work"       │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│         ↑ This is why NOMICA exists.                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Copy:**
```
You've tried the random YouTube workouts.
You've downloaded the PDFs that collect dust.
You've watched other women transform while you're stuck in the same loop.

It's not your fault. You just never had a SYSTEM.

NOMICA is that system.
```

---

#### SECTION 3: HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              THE NOMICA METHOD                              │
│              3 Steps to Your Dream Body                     │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │                 │  │                 │  │            │ │
│  │  01             │  │  02             │  │  03        │ │
│  │  ASSESS         │  │  SCULPT         │  │  TRANSFORM │ │
│  │                 │  │                 │  │            │ │
│  │  Take the quiz  │  │  Follow your    │  │  Track     │ │
│  │  → get matched  │  │  personalized   │  │  progress  │ │
│  │  to the right   │  │  program with   │  │  → see     │ │
│  │  program        │  │  video demos &  │  │  real      │ │
│  │                 │  │  coach support  │  │  results   │ │
│  │                 │  │                 │  │            │ │
│  └─────────────────┘  └─────────────────┘  └────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Step 1 Copy:**
```
TAKE THE QUIZ
Answer 5 quick questions about your goals, experience, and gym access.
We'll match you to the perfect program — no guesswork.
```

**Step 2 Copy:**
```
FOLLOW YOUR PROGRAM
Structured weekly workouts with video demos, progressive overload tracking,
and coach guidance. Every rep has a purpose.
```

**Step 3 Copy:**
```
WATCH YOURSELF TRANSFORM
Upload progress photos, track measurements, and get real feedback from your coach.
See the body you're building — week by week.
```

---

#### SECTION 4: PRODUCT SHOWCASE (Programs)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              CHOOSE YOUR PATH                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────────┐                                    │   │
│  │  │  [VIDEO     │   12-WEEK GLUTE SCULPT            │   │
│  │  │   PREVIEW]  │   $47                              │   │
│  │  │             │                                    │   │
│  │  │  ▶ 0:34     │   The program that started it all. │   │
│  │  └─────────────┘   12 weeks of progressive glute    │   │
│  │                     training. Video demos for every  │   │
│  │                     exercise. Coach support included. │   │
│  │                                                     │   │
│  │                     ✓ 48 workout videos              │   │
│  │                     ✓ Progressive overload system    │   │
│  │                     ✓ Coach feedback on form         │   │
│  │                     ✓ Progress tracking dashboard    │   │
│  │                                                     │   │
│  │                     [GET INSTANT ACCESS →]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Similar layout for each program]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### SECTION 5: SOCIAL PROOF / TRANSFORMATIONS

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              REAL WOMEN. REAL RESULTS.                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [CLIENT TRANSFORMATION — INTERNAL UPLOADED]        │   │
│  │                                                     │   │
│  │  ┌──────────┐  ┌──────────┐                         │   │
│  │  │  BEFORE  │  │  AFTER   │   Sarah, 28             │   │
│  │  │  [photo] │  │  [photo] │   12-Week Glute Sculpt  │   │
│  │  │          │  │          │                         │   │
│  │  └──────────┘  └──────────┘   "I never thought I    │   │
│  │                               could love my body    │   │
│  │                               this much. The        │   │
│  │                               structure changed     │   │
│  │                               everything."          │   │
│  │                                                     │   │
│  │  📊 -4" waist  ·  +3" hips  ·  12 lbs lost         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [SCROLLABLE CAROUSEL OF 5-8 TRANSFORMATIONS]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Metrics Display:**
```
Each transformation card includes:
- Internal before/after photos (uploaded via progress system)
- Name, age, program completed
- Quantified results (inches lost/gained, weight change, strength gains)
- Short quote (1-2 sentences max)
```

---

#### SECTION 6: WHY THIS WORKS

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              WHY NOMICA WORKS                               │
│              (When Everything Else Didn't)                  │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  🔬              │  │  📈              │               │
│  │  SCIENCE-BACKED  │  │  PROGRESSIVE     │               │
│  │  PROGRESSIVE     │  │  OVERLOAD        │               │
│  │  OVERLOAD        │  │  TRACKING        │               │
│  │                  │  │                  │               │
│  │  Every program   │  │  Your weights,   │               │
│  │  follows proven  │  │  reps, and sets  │               │
│  │  strength &      │  │  increase        │               │
│  │  hypertrophy     │  │  systematically. │               │
│  │  principles.     │  │  No plateaus.    │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  🎯              │  │  👩‍🏫              │               │
│  │  NO RANDOM       │  │  COACH           │               │
│  │  WORKOUTS        │  │  FEEDBACK        │               │
│  │                  │  │                  │               │
│  │  Every session   │  │  Real coaches    │               │
│  │  has a purpose.  │  │  review your     │               │
│  │  Every week      │  │  form, celebrate  │               │
│  │  builds on the   │  │  wins, and keep  │               │
│  │  last.           │  │  you accountable. │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### SECTION 7: LEAD MAGNET (Email Capture)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   FREE: 5-DAY GLUTE GUIDE                          │   │
│  │                                                     │   │
│  │   [VIDEO PREVIEW — 5 exercise clips playing]        │   │
│  │                                                     │   │
│  │   5 days. 5 workouts. Zero commitment.              │   │
│  │   Experience the NOMICA method before you invest.   │   │
│  │                                                     │   │
│  │   ┌─────────────────────────────┐                  │   │
│  │   │  Enter your email           │                  │   │
│  │   └─────────────────────────────┘                  │   │
│  │   [SEND ME THE GUIDE →]                            │   │
│  │                                                     │   │
│  │   ✓ No spam  ·  ✓ Unsubscribe anytime              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### SECTION 8: OBJECTION HANDLING

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              COMMON QUESTIONS                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "I'm a complete beginner. Is this for me?"         │   │
│  │  Yes. Every program includes beginner modifications │   │
│  │  and video demos. You'll never feel lost.           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  "I don't have time to work out every day"          │   │
│  │  Most programs are 3-4 days per week, 45-60 min.    │   │
│  │  Quality > quantity. Always.                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  "I work out at home. Do I need a gym?"             │   │
│  │  Some programs are gym-based, others are home.      │   │
│  │  The quiz matches you to what fits YOUR setup.      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  "What if I don't see results?"                     │   │
│  │  The system is designed for progressive results.    │   │
│  │  Plus, you have coach support to troubleshoot.      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  "Can I cancel anytime?"                            │   │
│  │  Absolutely. No contracts. No guilt. Cancel from    │   │
│  │  your dashboard with one click.                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

#### SECTION 9: FINAL CTA

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              YOUR TRANSFORMATION STARTS NOW                  │
│                                                             │
│  "The best time to start was yesterday.                    │
│   The second best time is right now."                      │
│                                                             │
│  ┌───────────────────────┐                                 │
│  │  TAKE THE 2-MIN QUIZ  │                                 │
│  │  → FIND MY PROGRAM    │                                 │
│  └───────────────────────┘                                 │
│                                                             │
│  ★★★★★ Join 2,400+ women who stopped waiting               │
│  and started transforming.                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 Pricing Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  CHOOSE YOUR TRANSFORMATION PATH                           │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  STARTER    │  │  PREMIUM    │  │  ELITE      │       │
│  │  $29/mo     │  │  $149/mo    │  │  $249/mo    │       │
│  │             │  │  MOST POPULAR│  │             │       │
│  │  Self-guided│  │  + Coach    │  │  + Priority │       │
│  │  training   │  │  + Messaging│  │  + Custom   │       │
│  │             │  │  + Check-ins│  │  + Video    │       │
│  │  [START]    │  │  [START]    │  │  [START]    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
│  ALL PLANS INCLUDE:                                        │
│  ✓ Full exercise video library (internal)                  │
│  ✓ Progress tracking dashboard                             │
│  ✓ Mobile-friendly access                                  │
│  ✓ Cancel anytime                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Copy per tier:**

| Plan | Headline | Description |
|------|----------|-------------|
| **Starter** | "Your Self-Guided Sculpt Journey" | Full video library, structured programs, progress tracking. Perfect for self-motivated women who want premium programming without 1:1 coaching. |
| **Premium** | "Your Personal Sculpt Coach" | Everything in Starter + dedicated coach, direct messaging, weekly check-ins, and form feedback. For women who want accountability and personalized guidance. |
| **Elite** | "The Full Transformation Experience" | Everything in Premium + priority coach access, custom program design, video form review, and transformation blueprint. For women who want elite-level results. |

---

### 3.3 Product Pages (Individual Programs)

Each product page follows this structure:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │                  │  │                              │   │
│  │  [HERO VIDEO     │  │  12-WEEK GLUTE SCULPT        │   │
│  │   — AUTOPLAY     │  │                              │   │
│  │   LOOP — 15 SEC] │  │  Build sculpted, powerful    │   │
│  │                  │  │  glutes in 12 weeks.         │   │
│  │  ▶ Preview 3:45  │  │                              │   │
│  │                  │  │  $47 — One-time purchase     │   │
│  └──────────────────┘  │                              │   │
│                        │  ✓ 48 workout videos          │   │
│                        │  ✓ Progressive overload plan  │   │
│                        │  ✓ Video demos for all moves  │   │
│                        │  ✓ Coach feedback included    │   │
│                        │  ✓ Progress tracking          │   │
│                        │                              │   │
│                        │  [GET INSTANT ACCESS →]       │   │
│                        │                              │   │
│                        │  30-day money-back guarantee  │   │
│                        └──────────────────────────────┘   │
│                                                             │
│  WHAT'S INSIDE                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ Week 1-4    │ │ Week 5-8    │ │ Week 9-12   │         │
│  │ Foundation  │ │ Build       │ │ Peak        │         │
│  │ Phase       │ │ Phase       │ │ Phase       │         │
│  │             │ │             │ │             │         │
│  │ 16 videos   │ │ 16 videos   │ │ 16 videos   │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                             │
│  SAMPLE WORKOUTS (Internal Video Previews)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ ▶ Hip    │ │ ▶ Glute  │ │ ▶ RDL    │ │ ▶ Hip    │    │
│  │   Thrust │ │   Bridge │ │   Form   │ │   Abduct.│    │
│  │   0:45   │ │   0:32   │ │   1:12   │ │   0:28   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.4 Quiz / Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 1/5                          ● ○ ○ ○ ○              │
│                                                             │
│  What's your primary goal?                                 │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  🍑             │  │  🔥             │                 │
│  │  Build my       │  │  Lose fat &     │                 │
│  │  glutes         │  │  tone up        │                 │
│  └─────────────────┘  └─────────────────┘                 │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  💪             │  │  ✨             │                 │
│  │  Get stronger   │  │  Overall        │                 │
│  │  & lean         │  │  confidence     │                 │
│  └─────────────────┘  └─────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 2/5                          ○ ● ○ ○ ○              │
│                                                             │
│  How would you describe your fitness level?                │
│                                                             │
│  [Beginner — new to gym or returning]                      │
│  [Intermediate — consistent for 6+ months]                 │
│  [Advanced — training seriously for 1+ year]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 3/5                          ○ ○ ● ○ ○              │
│                                                             │
│  Where do you train?                                       │
│                                                             │
│  🏋️ Full gym (barbells, machines, cables)                  │
│  🏠 Home (dumbbells, bands, minimal equipment)             │
│  🏃 Hybrid (gym + home)                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 4/5                          ○ ○ ○ ● ○              │
│                                                             │
│  How much time can you commit per week?                    │
│                                                             │
│  ⏱️ 2-3 days (30-45 min each)                              │
│  ⏱️ 3-4 days (45-60 min each)                              │
│  ⏱️ 5+ days (60+ min each)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  STEP 5/5                          ○ ○ ○ ○ ●              │
│                                                             │
│  Would you like coach support?                             │
│                                                             │
│  📱 Yes — I want accountability & feedback                 │
│  🎯 No — I'm self-motivated and ready to go               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  YOUR PERSONALIZED RECOMMENDATION                          │
│                                                             │
│  Based on your answers, we recommend:                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [VIDEO PREVIEW OF PROGRAM]                         │   │
│  │                                                     │   │
│  │  12-WEEK GLUTE SCULPT                               │   │
│  │  Perfect for intermediate gym-goers focused on      │   │
│  │  glute growth. Includes progressive overload &      │   │
│  │  coach feedback.                                    │   │
│  │                                                     │   │
│  │  [GET THIS PROGRAM — $47]                           │   │
│  │                                                     │   │
│  │  or explore other options ↓                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Enter your email to save your results:                    │
│  [email field] [SAVE MY RESULTS →]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.5 Club / Membership Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  INTRODUCING                                        │   │
│  │  THE NOMICA SCULPT CLUB                             │   │
│  │                                                     │   │
│  │  $39/month — Cancel anytime                         │   │
│  │                                                     │   │
│  │  The membership that keeps transforming.            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  WHAT YOU GET EVERY MONTH                                   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  🎬              │  │  👩‍🏫              │               │
│  │  MONTHLY WORKOUT │  │  COACH Q&A       │               │
│  │  DROPS           │  │  SESSIONS        │               │
│  │                  │  │                  │               │
│  │  8-12 new videos │  │  Live monthly    │               │
│  │  added to your   │  │  sessions with   │               │
│  │  library. Fresh  │  │  Coach Noella.   │               │
│  │  programming     │  │  Ask anything.   │               │
│  │  every month.    │  │  Get clarity.    │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  📸              │  │  🏆              │               │
│  │  TRANSFORMATION │  │  COMMUNITY       │               │
│  │  FEED           │  │  CHALLENGES      │               │
│  │                  │  │                  │               │
│  │  See real member │  │  Monthly         │               │
│  │  progress. Get   │  │  challenges with │               │
│  │  inspired. Share │  │  prizes. Stay    │               │
│  │  yours.          │  │  motivated.      │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  JOIN THE SCULPT CLUB — $39/mo                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  "This membership pays for itself the first week.          │
│   I've learned more in 2 months than 2 years of YouTube."  │
│   — Jessica, Sculpt Club member                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Product Catalog Architecture

### Product Data Model

```typescript
const PRODUCTS = [
  {
    id: "glute-sculpt-12wk",
    name: "12-Week Glute Sculpt",
    tagline: "Build sculpted, powerful glutes",
    price: 4700, // cents
    originalPrice: 6700,
    category: "PROGRAM",
    duration: "12 weeks",
    commitment: "4 days/week, 50 min",
    level: "INTERMEDIATE",
    equipment: "FULL_GYM",
    features: [
      "48 workout videos",
      "Progressive overload system",
      "Video demos for all exercises",
      "Coach feedback on form",
      "Progress tracking dashboard",
      "Private community access",
    ],
    previewMediaIds: ["glute-preview-1", "glute-preview-2"],
    highlights: [
      { label: "Programs Completed", value: "4,200+" },
      { label: "Avg. Results", value: "+3\" hips, -4\" waist" },
      { label: "Satisfaction", value: "4.9/5 stars" },
    ],
  },
  {
    id: "beginner-gym-guide",
    name: "Beginner Gym Guide",
    tagline: "Walk into any gym with confidence",
    price: 3700,
    originalPrice: 4700,
    category: "PROGRAM",
    duration: "8 weeks",
    commitment: "3 days/week, 45 min",
    level: "BEGINNER",
    equipment: "FULL_GYM",
    features: [
      "24 workout videos",
      "Gym equipment walkthrough",
      "Form basics for every lift",
      "Starter weight recommendations",
      "Progress tracking",
    ],
    previewMediaIds: ["beginner-preview-1"],
  },
  {
    id: "stairmaster-program",
    name: "Stairmaster Program",
    tagline: "The ultimate lower body cardio sculptor",
    price: 2700,
    originalPrice: 3700,
    category: "PROGRAM",
    duration: "4 weeks",
    commitment: "5 days/week, 30 min",
    level: "ALL_LEVELS",
    equipment: "STAIRMASTER",
    features: [
      "16 stairmaster routines",
      "Heart rate zone training",
      "Progressive difficulty levels",
      "Glute activation warm-ups",
    ],
    previewMediaIds: ["stair-preview-1"],
  },
  {
    id: "14-day-booty-challenge",
    name: "14-Day Booty Challenge",
    tagline: "14 days to wake up your glutes",
    price: 1400,
    originalPrice: 1900,
    category: "CHALLENGE",
    duration: "14 days",
    commitment: "5 days/week, 30 min",
    level: "BEGINNER",
    equipment: "MINIMAL",
    features: [
      "14 daily workout videos",
      "Bodyweight + band exercises",
      "Daily motivation emails",
      "Community challenge group",
    ],
    previewMediaIds: ["challenge-preview-1"],
  },
  {
    id: "workout-tracker",
    name: "NOMICA Workout Tracker",
    tagline: "Track every rep, see every gain",
    price: 1200,
    originalPrice: 1700,
    category: "TRACKER",
    duration: "Lifetime",
    commitment: "N/A",
    level: "ALL_LEVELS",
    equipment: "ANY",
    features: [
      "Digital workout journal",
      "Progress photo organizer",
      "Measurement tracker",
      "1RM calculator",
      "Monthly progress reports",
    ],
    previewMediaIds: [],
  },
];
```

### Product Card UI (Catalog Grid)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  SHOP PROGRAMS                                              │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│  │ [VIDEO        │ │ [VIDEO        │ │ [VIDEO        │    │
│  │  THUMBNAIL]   │ │  THUMBNAIL]   │ │  THUMBNAIL]   │    │
│  │               │ │               │ │               │    │
│  │ 12-WEEK       │ │ BEGINNER      │ │ STAIRMASTER   │    │
│  │ GLUTE SCULPT  │ │ GYM GUIDE     │ │ PROGRAM       │    │
│  │               │ │               │ │               │    │
│  │ Build sculpted│ │ Walk into any │ │ The ultimate  │    │
│  │ powerful      │ │ gym with      │ │ lower body    │    │
│  │ glutes.       │ │ confidence.   │ │ sculptor.     │    │
│  │               │ │               │ │               │    │
│  │ $47 $67       │ │ $37 $47       │ │ $27 $37       │    │
│  │ [GET ACCESS]  │ │ [GET ACCESS]  │ │ [GET ACCESS]  │    │
│  └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐                      │
│  │ [IMAGE        │ │ [IMAGE        │                      │
│  │  THUMBNAIL]   │ │  THUMBNAIL]   │                      │
│  │               │ │               │                      │
│  │ 14-DAY BOOTY  │ │ WORKOUT       │                      │
│  │ CHALLENGE     │ │ TRACKER       │                      │
│  │               │ │               │                      │
│  │ 14 days to    │ │ Track every   │                      │
│  │ wake up your  │ │ rep, see      │                      │
│  │ glutes.       │ │ every gain.   │                      │
│  │               │ │               │                      │
│  │ $14 $19       │ │ $12 $17       │                      │
│  │ [GET ACCESS]  │ │ [GET ACCESS]  │                      │
│  └───────────────┘ └───────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Premium Bundling & Upsell System

### Bundle Data Model

```typescript
const BUNDLES = [
  {
    id: "beginner-bundle",
    name: "Beginner Bundle",
    tagline: "Everything you need to start strong",
    price: 5700,
    originalPrice: 8400, // sum of individual
    savings: 2700,
    savingsPercent: 32,
    products: ["beginner-gym-guide", "14-day-booty-challenge", "workout-tracker"],
    badge: "BEST FOR BEGINNERS",
    highlight: true,
  },
  {
    id: "glute-bundle",
    name: "Glute Bundle",
    tagline: "The ultimate glute building collection",
    price: 7700,
    originalPrice: 10100,
    savings: 2400,
    savingsPercent: 24,
    products: ["glute-sculpt-12wk", "stairmaster-program", "workout-tracker"],
    badge: "MOST POPULAR",
    highlight: false,
  },
  {
    id: "ultimate-bundle",
    name: "Ultimate Transformation Bundle",
    tagline: "Everything NOMICA. One price.",
    price: 11700,
    originalPrice: 16700,
    savings: 5000,
    savingsPercent: 30,
    products: ["glute-sculpt-12wk", "beginner-gym-guide", "stairmaster-program", "14-day-booty-challenge", "workout-tracker"],
    badge: "BEST VALUE",
    highlight: false,
  },
];
```

### Bundle Card UI

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  BUNDLE & SAVE                                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────┐                                │   │
│  │  │                 │   ULTIMATE TRANSFORMATION      │   │
│  │  │  [STACKED CARD  │   BUNDLE                       │   │
│  │  │   LAYOUT —      │                                │   │
│  │  │   3 PRODUCT     │   Everything NOMICA.           │   │
│  │  │   IMAGES        │   One price.                   │   │
│  │  │   OVERLAPPING]  │                                │   │
│  │  │                 │   ✓ 12-Week Glute Sculpt       │   │
│  │  │                 │   ✓ Beginner Gym Guide          │   │
│  │  │                 │   ✓ Stairmaster Program         │   │
│  │  │                 │   ✓ 14-Day Booty Challenge      │   │
│  │  │                 │   ✓ Workout Tracker             │   │
│  │  │                 │                                │   │
│  │  │                 │   $117  $167                    │   │
│  │  │                 │   You save $50 (30%)           │   │
│  │  │                 │                                │   │
│  │  │                 │   [GET THE BUNDLE →]           │   │
│  │  └─────────────────┘                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. NOMICA Sculpt Club Membership

### Membership Tiers

```typescript
const MEMBERSHIP_TIERS = [
  {
    id: "sculpt-club",
    name: "Sculpt Club",
    price: 3900, // $39/mo
    features: [
      "Monthly workout drops (8-12 new videos)",
      "Full video exercise library",
      "Progress tracking dashboard",
      "Community transformation feed",
      "Monthly coach Q&A sessions",
      "Monthly challenges with prizes",
    ],
    highlight: true,
  },
  {
    id: "sculpt-club-pro",
    name: "Sculpt Club PRO",
    price: 7900, // $79/mo
    features: [
      "Everything in Sculpt Club",
      "1:1 monthly coach check-in",
      "Direct message access to coach",
      "Custom program adjustments",
      "Video form review (2/month)",
      "Priority challenge entry",
    ],
    highlight: false,
  },
];
```

### Membership Page Copy

**Hero:**
```
THE NOMICA SCULPT CLUB

Not just workouts. A transformation engine.

Fresh programming every month. Real coach support.
A community of women building bodies they love.

$39/month — Cancel anytime
```

**Value Stack:**
```
WHAT YOU'D PAY SEPARATELY:

  Custom workout programming:     $200/mo
  Coach Q&A access:              $150/mo
  Video form review:             $100/mo
  Progress tracking system:       $50/mo
  Community challenges:           $30/mo
  ─────────────────────────────────────
  Total value:                   $530/mo

  Your price today:               $39/mo

  You save:                       $491/mo (93% off)
```

---

## 7. Transformation & Social Proof System

### Transformation Card Schema

```typescript
type TransformationCard = {
  id: string;
  clientName: string;
  clientAge: number;
  programCompleted: string;
  duration: string;
  
  // Media (internal uploads only)
  beforePhotoId: string;
  afterPhotoId: string;
  
  // Metrics
  metrics: {
    label: string;
    before: string;
    after: string;
    change: string;
  }[];
  
  // Quote
  quote: string;
  rating: number; // 1-5
  
  // Verification
  verified: boolean;
  coachVerified: boolean;
};
```

### Transformation Section Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  REAL WOMEN. REAL RESULTS.                                  │
│  Not filtered. Not faked. Just hard work and structure.    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  [BEFORE]          [AFTER]                          │   │
│  │  ┌─────────┐      ┌─────────┐                      │   │
│  │  │         │  →   │         │   SARAH, 28          │   │
│  │  │  photo  │      │  photo  │   12-Week Glute      │   │
│  │  │         │      │         │   Sculpt             │   │
│  │  └─────────┘      └─────────┘                      │   │
│  │                                                     │   │
│  │  ─────────────────────────────────────────────     │   │
│  │  📊 -4" waist  ·  +3" hips  ·  12 lbs lost        │   │
│  │  ─────────────────────────────────────────────     │   │
│  │                                                     │   │
│  │  "I never thought I could love my body this much.  │   │
│  │   The structure changed everything. I finally know  │   │
│  │   what I'm doing and why."                          │   │
│  │                                                     │   │
│  │  ★★★★★  Verified transformation                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [← Previous]                              [Next →]         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ● ○ ○ ○ ○  (pagination dots)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Stats Bar

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  2,400+          12,000+          98%           4.9/5      │
│  WOMEN           PROGRAMS         WOULD          AVERAGE    │
│  TRANSFORMED     COMPLETED        RECOMMEND      RATING     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Lead Magnet + Quiz Onboarding Flow

### Lead Magnet: Free 5-Day Glute Guide

**Landing Section Copy:**
```
FREE: 5-DAY GLUTE GUIDE

5 days. 5 workouts. Zero commitment.

Experience the NOMICA method before you invest a single dollar.
Video demos for every exercise. Beginner-friendly. Gym or home.

Enter your email → get instant access.
```

**Email Capture Form:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  [5 EXERCISE VIDEO CLIPS PLAYING IN GRID]          │   │
│  │                                                     │   │
│  │  FREE: 5-DAY GLUTE GUIDE                           │   │
│  │                                                     │   │
│  │  5 days. 5 workouts. Zero commitment.              │   │
│  │  Experience the NOMICA method before you invest.    │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────┐                  │   │
│  │  │  your@email.com             │                  │   │
│  │  └─────────────────────────────┘                  │   │
│  │  [SEND ME THE GUIDE →]                            │   │
│  │                                                     │   │
│  │  ✓ No spam  ·  ✓ Unsubscribe anytime              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Quiz Flow (5 Steps)

| Step | Question | Options | Purpose |
|------|----------|---------|---------|
| 1 | What's your primary goal? | Build glutes / Lose fat & tone / Get stronger / Overall confidence | Goal matching |
| 2 | Fitness level? | Beginner / Intermediate / Advanced | Difficulty matching |
| 3 | Where do you train? | Full gym / Home / Hybrid | Equipment matching |
| 4 | Time commitment? | 2-3 days / 3-4 days / 5+ days | Program duration matching |
| 5 | Want coach support? | Yes / No | Plan tier matching |

### Quiz Result Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  YOUR PERSONALIZED RECOMMENDATION                          │
│                                                             │
│  Based on your answers:                                    │
│  → Goal: Build glutes                                      │
│  → Level: Intermediate                                     │
│  → Equipment: Full gym                                     │
│  → Time: 4 days/week                                       │
│  → Coaching: Yes                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [PROGRAM VIDEO PREVIEW — AUTOPLAY]                 │   │
│  │                                                     │   │
│  │  12-WEEK GLUTE SCULPT + COACHING                    │   │
│  │                                                     │   │
│  │  48 workout videos · Coach support · Progress       │   │
│  │  tracking · Form feedback                           │   │
│  │                                                     │   │
│  │  $149/month (Premium) or $47 one-time (Starter)    │   │
│  │                                                     │   │
│  │  [START MY TRANSFORMATION →]                        │   │
│  │                                                     │   │
│  │  or explore other programs ↓                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Save your results:                                 │   │
│  │  [email field] [SAVE →]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Objection Handling + FAQ + Footer

### FAQ Section

| Question | Answer |
|----------|--------|
| **"Is this really for beginners?"** | Absolutely. Every program includes beginner modifications and video demos for every exercise. You'll never feel lost or unsure what to do. |
| **"I don't have much time. How long are the workouts?"** | Most workouts are 30-50 minutes. We focus on quality over quantity. You'll do more in 45 focused minutes than 2 hours of random gym time. |
| **"Do I need a gym membership?"** | Some programs require a gym, others are home-based. Our quiz matches you to programs that fit YOUR setup — gym, home, or hybrid. |
| **"What if I don't see results?"** | The system is built on progressive overload science — it's designed to produce results. Plus, with coach support, we'll troubleshoot anything that isn't working. |
| **"Can I cancel my membership anytime?"** | Yes. No contracts. No guilt. Cancel from your dashboard with one click. Your access continues until the end of your billing period. |
| **"How is this different from YouTube workouts?"** | YouTube gives you random workouts. NOMICA gives you a SYSTEM — progressive programming, structured overload, form feedback, and a clear path from where you are to where you want to be. |
| **"Will I get bulky?"** | No. Building significant muscle mass requires years of dedicated training and specific nutrition. What you'll get is a sculpted, toned, strong physique. |
| **"Is my payment secure?"** | Yes. We use Stripe for payment processing — the same system used by Amazon, Shopify, and millions of businesses worldwide. |

### Footer

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  NOMICA                                      [Logo]        │
│  Premium feminine transformation fitness.                  │
│                                                             │
│  PROGRAMS           COMPANY           SUPPORT              │
│  Glute Sculpt       About             Contact              │
│  Beginner Guide     Blog              FAQ                  │
│  Stairmaster        Careers           Privacy Policy       │
│  Booty Challenge    Press             Terms of Service     │
│  Workout Tracker                      Cancellation Policy  │
│                                                             │
│  CONNECT                                                     │
│  [Instagram] [TikTok] [YouTube] [Twitter]                  │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  Contact: noella.bahatsi@tstech.com                        │
│  © 2024 NOMICA. All rights reserved.                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Technical Implementation Summary

### New Database Models Required

| Model | Purpose |
|-------|---------|
| `Media` | Store all uploaded media (videos, images) with metadata |
| `MediaTag` | Taggable system for media categorization |
| `ProgressLog` | Client progress entries with metrics and coach feedback |
| `ProgressPhoto` | Associated photos with angle classification |
| `Product` | Digital product catalog (programs, guides, trackers) |
| `Bundle` | Product bundles with pricing logic |
| `Membership` | Membership tier definitions |
| `UserMembership` | Active membership records |
| `QuizResponse` | Quiz completion data for recommendations |
| `LeadMagnet` | Email capture records for lead magnets |

### New API Routes Required

```
# Media System
POST   /api/media/upload              — Upload media (coach)
POST   /api/media/progress            — Upload progress (client)
GET    /api/media                     — List/search media
GET    /api/media/[id]                — Get media item
PATCH  /api/media/[id]                — Update metadata
DELETE /api/media/[id]                — Delete media
GET    /api/media/tags                — List tags

# Progress System
GET    /api/client/[id]/progress      — Progress timeline
POST   /api/client/[id]/progress      — Create progress entry
PATCH  /api/progress/[id]             — Update progress entry
POST   /api/progress/[id]/comment     — Coach comment

# Products & Bundles
GET    /api/products                  — List products
GET    /api/products/[id]             — Get product
GET    /api/bundles                   — List bundles
GET    /api/bundles/[id]              — Get bundle

# Quiz
POST   /api/quiz                      — Submit quiz answers
GET    /api/quiz/[id]/results         — Get recommendations

# Lead Magnet
POST   /api/lead-magnet               — Capture email
POST   /api/lead-magnet/verify        — Verify email
```

### New Pages Required

```
/                                    — Homepage (redesigned)
/pricing                             — Pricing page (redesigned)
/programs                            — Product catalog
/programs/[slug]                     — Individual product page
/bundles                             — Bundle catalog
/club                                — Sculpt Club membership
/quiz                                — Quiz flow (5 steps)
/quiz/results/[id]                   — Quiz results
/lead-magnet                         — Free guide landing
/transformations                     — Social proof gallery
/client/subscription                 — Subscription management (existing)
/client/progress                     — Progress timeline (existing)
/coach/media                         — Media library (new)
/coach/media/upload                  — Upload interface (new)
```

### Component Architecture

```
components/
├── landing/
│   ├── hero-section.tsx           — Video hero with CTA
│   ├── problem-section.tsx        — Pain point cards
│   ├── how-it-works.tsx           — 3-step process
│   ├── product-showcase.tsx       — Program cards
│   ├── social-proof.tsx           — Transformation carousel
│   ├── why-this-works.tsx         — Value proposition
│   ├── lead-magnet.tsx            — Email capture
│   ├── objection-handling.tsx     — FAQ accordion
│   └── final-cta.tsx              — Closing CTA
│
├── products/
│   ├── product-card.tsx           — Catalog card
│   ├── product-detail.tsx         — Full product page
│   ├── bundle-card.tsx            — Bundle display
│   └── bundle-stack.tsx           — Stacked card layout
│
├── membership/
│   ├── membership-tier.tsx        — Tier card
│   ├── value-stack.tsx            — Price comparison
│   └── feature-grid.tsx           — Feature highlights
│
├── quiz/
│   ├── quiz-step.tsx              — Single step
│   ├── quiz-progress.tsx          — Progress indicator
│   ├── quiz-result.tsx            — Recommendation
│   └── quiz-option.tsx            — Selectable option
│
├── media/
│   ├── media-player.tsx           — Internal video player
│   ├── media-grid.tsx             — Upload grid
│   ├── media-upload.tsx           — Upload form
│   ├── media-tag.tsx              — Tag pill
│   └── media-preview.tsx          — Thumbnail preview
│
├── progress/
│   ├── progress-timeline.tsx      — Timeline view
│   ├── progress-card.tsx          — Single entry
│   ├── progress-metrics.tsx       — Measurement display
│   ├── progress-upload.tsx        — Upload form
│   └── coach-feedback.tsx         — Coach comment
│
└── social-proof/
    ├── transformation-card.tsx    — Before/after card
    ├── transformation-carousel.tsx — Scrollable carousel
    ├── stats-bar.tsx              — Metric counters
    └── testimonial-card.tsx       — Quote card
```

### Implementation Priority

| Phase | Scope | Effort |
|-------|-------|--------|
| **Phase 1** | Media upload system + database schema | 2-3 weeks |
| **Phase 2** | Homepage redesign (all sections) | 2 weeks |
| **Phase 3** | Product catalog + individual pages | 1-2 weeks |
| **Phase 4** | Bundle system + pricing updates | 1 week |
| **Phase 5** | Sculpt Club membership page | 1 week |
| **Phase 6** | Quiz flow + lead magnet | 1-2 weeks |
| **Phase 7** | Transformation gallery + social proof | 1 week |
| **Phase 8** | Polish, testing, optimization | 1-2 weeks |

**Total estimated effort: 11-15 weeks for full implementation.**

---

*Blueprint prepared for NOMICA — Premium Feminine Transformation Fitness*
*Contact: noella.bahatsi@tstech.com*
