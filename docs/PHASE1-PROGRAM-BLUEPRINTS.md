# Phase 1 — Content Assessment & Program Blueprints

**Project:** NomiTips · **Website:** https://nomitips.com
**Coach (verified owner):** `nomitipscoaching@gmail.com` — Bahatsi Noella Akayezu, `CoachProfile cmu8z41ef00039r0ofmab3tif`
**Phase:** 1 — Content Audit & Program Design · **Status:** APPLIED — Phase 3 loader ran against production 2026-11-13 (pre-write backup: `backups/phase3-pre-load-20261113-144523.dump`)
**Companion document:** `docs/PHASE1-RESEARCH-RECORD.md` (all citations verified in this phase)

> **No database records were read-modified or written during Phase 1.** Every program ID, week count, day count and exercise count below was read from production in read-only mode during Phase 0 and re-confirmed in Phase 1.

---

# PART 1 — Content assessment

## 1.1 What each program is supposed to achieve

| # | Program | ID | Category | Intended objective |
|---|---|---|---|---|
| B1 | 21-Day Booty Band Challenge | `cmv5x6sbi00d28ukwn0bnk7br` | Band activation challenge | Teach glute activation and five foundational movement patterns; build the technique base that the paid glute programs assume |
| B2 | 8 Weeks Glutes & Quads Growth Blueprint | `cmv5x7v3q00dc8ukw77vhpojq` | Lower-body hypertrophy | Intermediate glute hypertrophy over a full eight-week block with barbell, dumbbell and bench |
| B3 | 21-Day Strong Abs & Core Challenge | `cmv5xaclg00dm8ukwjstlb16f` | Trunk motor control | Build bracing, anti-extension and anti-rotation control plus local trunk endurance |
| B4 | 6-Week Full Body Dumbbell Sculpt | `cmv5xb2ea00dr8ukwolzowrq7` | Full-body strength-endurance | Cover six movement patterns twice weekly with dumbbells only |
| B5 | 4-Week Resistance Band Full Body Sculpt | `cmv5xbva100dw8ukwhek7tdqe` | Band circuit conditioning | Full-body strength and work capacity with one band and no other equipment |
| B6 | 4-Week Upper Body Dumbbell Sculpt | `cmv5xcon300e18ukw0yz2maf0` | Upper-body hypertrophy split | Four-day upper split for arms, shoulders, back and chest |
| B7 | 8 Weeks Dumbbell Full Body Sculpt | `cmw7bmx5e0035rhkwsydkol5t` | *(undefined — empty)* | Unclear; title overlaps B4 at 67% token similarity |
| B8 | 6 Weeks Dumbbells Full Body Sculpt | `cmw7boaxz003crhkwbuxhgcaf` | *(undefined — empty)* | Unclear; title overlaps B4 at 67% token similarity |
| B9 | 30 Days Glute Growth Challenge | `cmw7bzt5w0049rhkwyjc2c5yq` | *(undefined — empty)* | Description: "For women who want to grow round and firm glutes" |
| B10 | NoMi 8 Weeks Signature Program | `cmwceu3zc0056rhkwm11aasy3` | *(undefined — empty)* | Description: "weight loss, and muscle building… 8 weeks workout plan + Diet Recommendation" |
| B11 | Stripe Payment Test | `cmw22nhso0000h40oqlqb699d` | Payment test | Explicitly "No workouts or training materials included" |
| O1 | *6-Week Dumbbell Glute Growth* | **no Program row** | Lower-body hypertrophy (dumbbell-only) | Sells for $19.99; sits in 2 bundles; has zero workout content |
| O2 | *6-Week Glutes & Quads Builder* | **no Program row** | Lower-body balanced (glutes + quads) | Sells for $19.99; sits in 2 bundles; has zero workout content |

---

## 1.2 Missing content vs. content that merely needs editing

Classification key:
**M** = missing entirely · **E** = present but must be rewritten · **K** = adequate, preserve

| Requirement | B1 | B2 | B3 | B4 | B5 | B6 | B7–B10 | O1/O2 |
|---|---|---|---|---|---|---|---|---|
| Program introduction | E (92 ch) | E (86 ch) | E (97 ch) | E (90 ch) | E (91 ch) | E (89 ch) | **M** / E | **M** (product tagline only) |
| Intended audience | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Experience level stated in copy | **M** (difficulty field exists) | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Equipment list | K (product field) | K | K | K | K | K | **M** | K (product field) |
| Training methodology | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Weekly structure (distinct weeks) | **E — all 3 weeks identical** | **E — all 8 weeks identical** | **E — all 3 weeks identical** | **E — all 6 weeks identical** | **E — all 4 weeks identical** | **E — all 4 weeks identical** | **M** | **M** |
| Weekly objective text | E (8 generic phase names shared across the whole catalog) | E | E | E | E | E | **M** | **M** |
| Session objective | **K** (171/171 days titled, 38 distinct) | K | K | K | K | K | **M** | **M** |
| Warm-up | **M** (0 sessions) | **M** (0 sessions) | **M** (0 sessions) | **M** (0 sessions) | **M** (0 sessions) | **M** (0 sessions) | **M** | **M** |
| Cooldown | **M** (1 incidental stretch in B1 only) | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Exercise sequence sensible | K | K | K | K | K | K | n/a | n/a |
| Sets / reps / rest present | **K** (845/845 sets, 623 reps, 845 rest) | K | K | K | K | K | n/a | n/a |
| Intensity guidance | **M** (no RPE, no tempo, no load cue) | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Progression across program | E (monotonic increase only: sets +1/2wk capped 5, reps +2 from wk4) | E | E | E | E | E | **M** | **M** |
| Planned recovery / deload | **M** | **M** (8 weeks, no deload) | **M** | **M** (6 weeks, no deload) | **M** | **M** | **M** | **M** |
| Exercise instructions | **E — 1 sentence (avg 134 ch)** | E | E | E | E | E | **M** | **M** |
| Modifications / alternatives | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Breathing guidance | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Common mistakes | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Educational content | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Safety information | **M** | **M** | **M** | **M** | **M** | **M** | **M** | **M** |
| Exercise demonstrations | **M — 0 videos, 0 Media rows, 0 `videoUrl`** | M | M | M | M | M | M | M |
| Purchase / entitlement flow | **K** | K | K | K | K | K | n/a | **BROKEN** (no Program) |

**Summary:** 6 programs have *structure* but need rewriting across every content dimension. 4 programs have no structure at all. 2 sellable products have no Program row. Nothing in the catalog currently has a warm-up, a cooldown, a deload, intensity guidance, safety text or a video.

---

## 1.3 Technical/structural problems that constrain the blueprints

| Constraint | Consequence for design |
|---|---|
| `Exercise.instructions` is a single `@db.Text` column | Full technique guidance (start / execution / breathing / mistakes / modification / progression) must be written as one consistently-structured paragraph block |
| `Program.description` is not rendered on any program page | Program introduction must go into **`Product.description`** (rendered on the owned-program page) |
| Public product page renders `Product.tagline`, `features[]`, `equipment[]`, `durationLabel`, `daysPerWeek` only | Pre-purchase copy lives in those four fields |
| `ProgramWeek.title` and `ProgramDay.title` render as `Week N · title` / day heading | Weekly objective = week title; session objective = day title |
| `ProgramExercise.notes` renders under each exercise in both the client page and the workout player | Warm-up / cooldown labels, tempo, RPE, "each side", band resistance level and alternatives all live here |
| Workout player requires `sets ≥ 1` and computes set rows from it | Warm-up and cooldown entries must carry real `sets` values (e.g. 2 rounds) |
| No schema field for recovery days, warm-ups, cooldowns or education blocks | Recovery days are expressed by **not** creating day rows for days 6–7 (the dashboard already renders "Rest Day"); warm-up/cooldown are ordinary `ProgramExercise` rows at the head and tail of the day |
| `deleteProgram()` orphans linked `Product` rows | Fixed as a code change proposal (T4), not a content change |

---

# PART 2 — Shared conventions used by every blueprint

These apply to all blueprints and are stated once so they are not repeated.

### 2.1 Session skeleton (every session, every program)

| Rows | Block | `notes` convention | Target time |
|---|---|---|---|
| 1–2 | **Warm-up — pulse raiser + dynamic mobility** | `Warm-up · 1 of 2` | 2–3 min |
| 3 | **Warm-up — movement-specific activation** | `Warm-up · activation` | 1–2 min |
| 4–8 | **Main work** (4–5 exercises) | coaching cue, tempo, RPE, "each side", band level | 20–30 min |
| 9 | **Cooldown — breathing + stretch** | `Cooldown · hold 30–45s each` | 2–4 min |

Sessions therefore carry **8–9 `ProgramExercise` rows** instead of the current 4–5, and each block is explicitly labelled in `notes` so the customer can see where the warm-up ends.

### 2.2 Progression rule (global)

One variable advances per exercise per week, in this order:

1. technique and consistency → 2. repetitions → 3. sets → 4. band resistance or load → 5. rest interval or tempo

**Never two at once.** Load increases follow the ACSM 2–10 % rule and are expressed in `notes` as an RPE target plus the rule ("add 2–10 % when you can beat the target by 1–2 reps").

### 2.3 Recovery rule (global)

- Two rest days per week — expressed by having 5 (or 4) `ProgramDay` rows and no rows for the remaining days.
- Programs of **6 weeks or longer** receive a planned deload week (research R11/R12): same exercises, ~40 % fewer sets, reps held, rest +30 s, RPE 5.
- Programs of 4 weeks or shorter receive a **consolidation week** instead of a deload.
- Reactive rule, written into every program's education text: repeat the previous week if performance drops for two consecutive sessions or soreness persists.

### 2.4 Exercise ordering rule (global)

Warm-up → priority compound → secondary compound → accessory → isolation → trunk/carry → cooldown (research R1, R7).

### 2.5 Field mapping

| Content | Field |
|---|---|
| Program introduction: purpose, audience, level, equipment, duration, frequency, session length, methodology, learning outcomes, safety | `Product.description` |
| One-sentence positioning (pre-purchase) | `Product.tagline` |
| Five feature bullets (audience · equipment · frequency · methodology · what's included) | `Product.features[]` |
| Equipment | `Product.equipment[]` |
| Weekly objective | `ProgramWeek.title` |
| Session objective | `ProgramDay.title` |
| Technique: start / execution / breathing / mistakes / modification / progression | `Exercise.instructions` |
| Warm-up & cooldown labels, tempo, RPE, "each side", band level, alternatives | `ProgramExercise.notes` |
| Sets / reps / duration / rest | `ProgramExercise.sets`, `.reps`, `.duration`, `.restSeconds` |

### 2.6 Exercise library status

The production library holds **87 exercises**: GLUTES 13 · LEGS 15 · CORE 16 · CARDIO 17 · ARMS 7 · BACK 5 · SHOULDERS 5 · CHEST 4 · MOBILITY 5.
Warm-ups are buildable from what already exists (`March in Place`, `Step Jack`, `Lateral Step Touch`, `Torso Rotation`, `Cat-Cow`, `World's Greatest Stretch`, `Hip Flexor Stretch`, `Hamstring Stretch`, `Child's Pose` + activation moves). Two exercises are unused today (`Lateral Lunge`, `Leg Press`) and will be put to work in O1/O2. No new exercises are strictly required; a small number of additions are listed as optional in each blueprint's gap section.

---

# PART 3 — Program blueprints

---

## BP-01 · 21-Day Booty Band Challenge

**1. Program identity**
`cmv5x6sbi00d28ukwn0bnk7br` · CHALLENGE · $9.99 · BEGINNER · 3 weeks · 5 days/week · resistance band · home or gym · focus `SCULPT` · currently 3 wk / 15 days / 75 entries.

**2. Training methodology**
*Motor-patterning and activation challenge — not a hypertrophy program.* The purpose is to teach the glutes to fire and to master five patterns (lateral walk, bridge, hinge, abduction, lunge) with short circuit sessions. Volume per session stays deliberately low so a true beginner can finish every session in ~22 minutes and return the next day. This is the on-ramp into BP-02 and O1, and the copy says so.

**3. Weekly structure**

| Week | Title (weekly objective) | Days | What actually changes |
|---|---|---|---|
| 1 | **Foundation — learn the five patterns** | Band Activation · Band Strength · Glute Burn · Core + Glutes · Band Finisher | 3 sets, tempo 3-1-1, rest 45–60 s, beginner-only movements |
| 2 | **Build — same patterns, less rest** | same five titles | reps +2 on the two primary lifts of each day, rest −10 s, introduce one unilateral move per day (Single-Leg Glute Bridge, Banded Kickback, Curtsy Lunge) |
| 3 | **Express — density and independence** | same five titles | +1 set on the two primary lifts only, rest −10 s, add Frog Pump / Glute Bridge March / Banded Good Morning for variety; Day 5 becomes a technique-plus-stretch finisher rather than a max-effort session |

Weeks differ in **exercise selection as well as numbers** — week 3 uses three movements week 1 does not.

**4. Session objectives** — already present and good; titles are preserved.
`Band Activation` (prime), `Band Strength` (loaded patterns), `Glute Burn` (high-rep metabolic), `Core + Glutes` (trunk integration), `Band Finisher` (density + mobility).

**5. Exercise selection principles**
Glute-primary, minimal trunk work, no upper body. Order: activation → compound pattern → abduction work → trunk → stretch. Every session opens with `March in Place`/`Step Jack` + `Cat-Cow`/`Hip Flexor Stretch` + `Glute Bridge` or `Clamshell` activation, and closes with `Child's Pose` or `Hamstring Stretch`.

**6. Progression strategy**
Week 1 technique → week 2 reps + rest reduction → week 3 sets. One variable per week. No load progression is possible with a single band, so band resistance level is the load variable and is named in `notes` ("light band", "medium band", "heavy band").

**7. Recovery strategy**
Two rest days weekly (days 6–7, no rows). Session volume capped at 5 work exercises. Week 3 Day 5 is a low-intensity finisher. Three weeks is too short for a deload (R11 places deloads at 4–6 week intervals).

**8. Equipment alternatives**
Required: one loop resistance band. If only a long band with handles is available, anchor it for lateral walks and kickbacks. No band at all → bodyweight equivalents named in `notes` on each affected row (`Glute Bridge`, `Clamshell` without band, `Donkey Kick`, `Fire Hydrant`).

**9. Safety considerations**
Band above the knees, never on the joint; check the band for nicks before every session; ribs down and hips level in bridges — do not arch the lower back; knees track over toes in squats and lunges; sharp or pinching pain is a stop signal, ordinary muscle fatigue is not. Explicit statement: this is general fitness education, not rehabilitation, and anyone with hip, knee or back pain should see a qualified professional first.

**10. Content gaps requiring development**
Rewrite the 92-character description into a full introduction (purpose, audience, level, equipment, frequency, session length ~22 min, methodology, five learning outcomes, safety). Add warm-up and cooldown rows to all 15 days. Differentiate the three weeks by selection as well as numbers. Add RPE/tempo/band-level notes. Rewrite all 13 glute + related exercise instructions into the structured format. Correct the feature bullet that promises "video demonstrations" (none exist). No new exercises required.

---

## BP-02 · 8 Weeks Glutes & Quads Growth Blueprint

**1. Program identity**
`cmv5x7v3q00dc8ukw77vhpojq` · PROGRAM · $29.99 · INTERMEDIATE · 8 weeks · 5 days/week · dumbbells, barbell, bench · home or gym · currently 8 wk / 40 days / 200 entries.

**2. Training methodology**
*Lower-body hypertrophy block with upper-body maintenance.* Glutes are trained directly four days out of five; the upper-body day exists to keep the rest of the body balanced, not to develop it. The week undulates: heavy neural day, volume day, upper maintenance, posterior-chain day, high-rep metabolic day. This is structurally unlike BP-04 (full body, six patterns, dumbbells only) and unlike BP-01 (activation circuits).

**3. Weekly structure**

| Week | Title | Objective | Change vs. previous |
|---|---|---|---|
| 1 | **Foundation** | Standardise squat, hinge and thrust technique | 3 sets, RPE 6–7 |
| 2 | **Build** | Add work to the heavy and posterior days | +1 set on D1 and D4 primary lifts only |
| 3 | **Volume** | Accumulate hard sets | +1 set on D2 and D5, accessory rest −15 s |
| 4 | **Deload** | Absorb the first three weeks | Same exercises, ~40 % fewer sets (2), reps held, rest +30 s, RPE 5 |
| 5 | **Intensify** | Return to week 3 work with better recovery | Load cue: +2–10 % when target beaten by 1–2 reps (ACSM) |
| 6 | **Peak** | Express strength on the main lifts | Top set + back-off on D1/D4 primaries; RPE 8–9 there only |
| 7 | **Overreach** | Highest volume of the block | One extra set on the primary of each day; RPE 8 |
| 8 | **Consolidate** | Prove the gains, land safely | Drop back to week 1–2 volume; retest week 5 loads for more reps; RPE 6–7 |

**4. Session objectives** — existing titles preserved and made genuinely different:
`Barbell Strength` (squat/hinge at 3–5 reps) · `Hypertrophy` (glute/quad volume at 8–12) · `Upper + Core` (maintenance at 8–12) · `Posterior Chain` (hinge/hamstring/glute at 6–10) · `Glute Peak` (12–20 reps plus a carry).

**5. Exercise selection principles**
Multi-joint before single-joint, larger before smaller, higher intensity before lower (R1, R7). Barbell work on D1/D4 early in the week when freshness is highest; isolation (kickbacks, curls, raises) always last. Rear-delt and row work on the upper day keeps shoulder health alongside pressing.

**6. Progression strategy**
One variable per week per exercise (§2.2). Weeks 1–3 accumulate, week 4 removes stress, weeks 5–7 intensify, week 8 consolidates. Load is prescribed by RPE plus the 2–10 % rule written into `notes`, because percentage-of-1RM cannot be displayed in the schema.

**7. Recovery strategy**
Planned deload in week 4 (R11/R12). Two rest days weekly. Week 8 is a consolidation rather than a peak so the customer finishes feeling capable, not destroyed. Reactive rule in the education text: if two consecutive sessions underperform, repeat the week.

**8. Equipment alternatives**
Barbell → dumbbells (`Barbell Back Squat` → `Goblet Squat`, `Barbell RDL` → `Dumbbell RDL`, `Barbell Hip Thrust` → `Dumbbell Hip Thrust`). Bench → floor for hip thrusts, or a sturdy sofa edge. Leg press available in gyms as a substitute for a squat variation on D5. Every substitution is named in `notes`.

**9. Safety considerations**
Hip thrust: upper back on the bench, chin slightly tucked, ribs down, drive through the heels — do not hyperextend at the top. RDL: neutral spine, weights close to the legs, stop at first hamstring stretch rather than chasing the floor. Squat: knees track over toes, whole foot planted. Barbell work requires a rack or a clear floor. Soreness for 24–72 hours is expected; joint pain, dizziness or sharp back pain is not. Not a program for anyone rehabbing an injury.

**10. Content gaps requiring development**
Full introduction in `Product.description`. Warm-up and cooldown rows across all 40 days. Real week-to-week differentiation (currently all eight weeks are the same five sessions). Deload week 4 and consolidation week 8. RPE/tempo/substitution notes. Structured rewrite of all instructions used. Correct the "video demonstrations" feature bullet. Optional library additions: `Face Pull`, `Hip Thrust` tempo variant — not required.

---

## BP-03 · 21-Day Strong Abs & Core Challenge

**1. Program identity**
`cmv5xaclg00dm8ukwjstlb16f` · CHALLENGE · $9.99 · BEGINNER · 3 weeks · 5 days/week · exercise mat · currently 3 wk / 15 days / 75 entries.

**2. Training methodology**
*Trunk motor-control and endurance challenge built on four movement categories* (R8): anti-extension, anti-rotation, lateral flexion / anti-lateral, and dynamic flexion-extension. Each session takes **one category as primary and one as secondary**, and the emphasis rotates across the five days so the trunk is never loaded the same way twice in a row. Every session also contains **one compound movement** (R9) so the trunk is trained under load rather than only on the floor. Sessions run 15–20 minutes.

This is deliberately not a resistance-training program with a different title: it has shorter sessions, isometric-first loading, no external load in weeks 1–2, and its own progression logic (hold time → complexity → load).

**3. Weekly structure**

| Week | Title | Objective | Change |
|---|---|---|---|
| 1 | **Foundation — learn to brace** | Breath, rib position, neutral spine | Isometrics only, 2–3 sets, long holds, no dynamic work |
| 2 | **Build — add motion** | Control under movement | Add dynamic exercises, rest −15 s, add an instability option (e.g. Marching Plank) |
| 3 | **Express — integrate and carry** | Trunk work that transfers | Circuits of 3 rounds, add loaded carries and the compound pairings, longer final holds |

**4. Session objectives** — existing titles preserved:
`Core Foundation` (anti-extension) · `Lower Abs` (dynamic flexion) · `Obliques` (rotation and lateral) · `Deep Core` (anti-rotation + bracing) · `Core Circuit` (integrated).

**5. Exercise selection principles**
Anti-extension: `Plank`, `Hollow Body Hold`, `Dead Bug`, `Marching Plank`. Anti-rotation: `Band Pallof Press`, `Bird Dog`, `Russian Twist`. Lateral: `Side Plank`, `Standing Side Crunch`. Dynamic flexion: `Crunch`, `Bicycle Crunch`, `Toe Touch Crunch`, `Lying Leg Raise`, `Heel Tap`, `Flutter Kicks`, `V-Up` (week 3 only). Compound pairing: `Goblet Squat`, `Push-Up`, `Single-Arm Dumbbell Row`, `Step-Up`, `Reverse Lunge`. Mobility closer: `Cat-Cow`, `Child's Pose`, `World's Greatest Stretch`.

**6. Progression strategy**
Isometric hold time → sets → complexity (remove a limb, e.g. plank to single-arm) → external load → circuit density. One step per week. `V-Up` is gated to week 3 because it is the only ADVANCED core movement in the library.

**7. Recovery strategy**
Two rest days weekly. No deload in three weeks (R11 sets the interval at 4–6 weeks). Week 3 Day 5 is a circuit rather than a maximal hold session. Education text states plainly that three weeks builds control and local endurance, and that the evidence base for measurable performance change starts at four weeks (R10) — so the customer is not promised a transformation.

**8. Equipment alternatives**
Required: mat (or carpet). Optional: one light dumbbell for loaded carries in week 3, one band for `Band Pallof Press`. Everything else is bodyweight, so the program is fully deliverable with no equipment at all.

**9. Safety considerations**
Hands behind the head are light — curl from the sternum, never yank the neck. In leg raises, reduce the range before letting the lower back arch off the floor. Exhale on effort, inhale on the return; never hold the breath through a set. No sit-up-style loaded spinal flexion for beginners. Explicit exclusions: this is not a treatment for back pain, diastasis recti, hernia or any medical condition — those require a clinician. Sharp pain anywhere is a stop signal.

**10. Content gaps requiring development**
Rewrite the 97-character description and soften the tagline's "build a tighter midsection" into a control-and-posture outcome. Add warm-up and cooldown rows to all 15 days. Differentiate all three weeks by selection. Add compound pairings (currently zero non-core movements besides the incidental ones). Add RPE/tempo notes. Rewrite all 16 core + related instructions. Correct the "video demonstrations" bullet. Optional additions: `Copenhagen Plank`, `Ab Wheel Rollout` — not required.

---

## BP-04 · 6-Week Full Body Dumbbell Sculpt

**1. Program identity**
`cmv5xb2ea00dr8ukwolzowrq7` · PROGRAM · $19.99 · INTERMEDIATE · 6 weeks · 5 days/week · dumbbells · home or gym · currently 6 wk / 30 days / 150 entries.

**2. Training methodology**
*Full-body alternating-emphasis strength-endurance.* Not a body-part split: the six movement patterns (squat, hinge, push, pull, lunge, carry/core) each appear twice across the week, distributed over five sessions with different densities. Day 1 and Day 2 are pattern-paired strength days; Days 3 and 4 are full-body accumulation days with different rep zones; Day 5 is low-load conditioning so the week always ends with a session that does not need fresh legs.

**3. Weekly structure**

| Week | Title | Objective | Change |
|---|---|---|---|
| 1 | **Foundation** | Learn all six patterns with dumbbells | 3 sets, RPE 6–7 |
| 2 | **Build** | Add work to the pattern-paired days | +1 set on D1/D2 primary lifts only |
| 3 | **Volume** | Accumulate full-body hard sets | +1 set on D3/D4, accessory rest −15 s |
| 4 | **Deload** | Absorb the block | Same exercises, 2 sets, reps held, rest +30 s, RPE 5 |
| 5 | **Intensify** | Return with better recovery | Load cue +2–10 % when target beaten by 1–2 reps |
| 6 | **Peak & Test** | Prove it | Top set on each compound, then a retest of week 1 rep targets at week 5 loads |

**4. Session objectives** — existing titles preserved:
`Push + Legs` · `Pull + Posterior` · `Full Body A` · `Full Body B` · `Conditioning + Core`.

**5. Exercise selection principles**
Multi-joint first (R7): `Goblet Squat`/`Barbell Back Squat` before `Reverse Lunge`; `Dumbbell Bench Press` before `Lateral Raise`; `Dumbbell Bent-Over Row` before `Rear Delt Fly`. Press and pull are paired on the same day so no session creates an imbalance. Conditioning day uses `Step Jack`, `Low-Impact Skater`, `Mountain Climber`, `Squat to Calf Raise` at short rest.

**6. Progression strategy**
§2.2 — one variable per week. The conditioning day progresses by **work-to-rest ratio**, not by load, so it never competes with the strength days for recovery.

**7. Recovery strategy**
Planned deload in week 4 (R11). Two rest days weekly. Week 6 ends with a test rather than a volume push. Reactive rule included in the education text.

**8. Equipment alternatives**
Dumbbells only. Barbell movements, where a customer has a bar, are noted as an upgrade option. `Bench Dip` → floor dip; `Step-Up` → sturdy low step; `Incline Dumbbell Press` → floor press at a reduced range. Every session is deliverable with a single pair of adjustable dumbbells.

**9. Safety considerations**
Hip hinge: neutral spine, dumbbells close to the legs, stop at first hamstring stretch. Press: shoulder blades pinned, do not flare the ribs. Lunge: front knee tracks over toes, torso upright. Controlled eccentric — dropping dumbbells from the top is never acceptable. Warm-up is mandatory because this is the highest-frequency dumbbell program in the catalog.

**10. Content gaps requiring development**
Full introduction. Warm-up and cooldown rows across all 30 days. Real week-to-week differentiation (all six weeks currently identical). Deload week 4, test week 6. RPE/tempo/substitution notes. Structured instruction rewrite. Correct the "video demonstrations" bullet.

---

## BP-05 · 4-Week Resistance Band Full Body Sculpt

**1. Program identity**
`cmv5xbva100dw8ukwhek7tdqe` · PROGRAM · $14.99 · BEGINNER · 4 weeks · 5 days/week · resistance band · minimal equipment · currently 4 wk / 20 days / 100 entries.

**2. Training methodology**
*Band-only full-body circuit conditioning with a strength emphasis.* Structurally the opposite of the dumbbell programs: **every session is full-body**, rest is short (30–45 s), rep ranges are high, and sessions are built from rounds rather than straight sets. This matches the local-muscular-endurance loading zone in R1 (40–60 % 1RM, >15 reps, rest <90 s) and the finding in R6 that elastic resistance produces strength gains comparable to dumbbells when effort is matched.

**3. Weekly structure**

| Week | Title | Objective | Change |
|---|---|---|---|
| 1 | **Foundation** | Learn every anchor and band position | 2 rounds, rest 45 s, moderate band |
| 2 | **Build** | Denser circuits | 3 rounds, rest −10 s |
| 3 | **Volume** | More work in the same time | 3–4 rounds, +2 reps on primary movements |
| 4 | **Peak & Retest** | Confirm the adaptation | 4 rounds at the strongest band; retest week 1 rep targets |

Four weeks is too short for a deload, so week 4 is a consolidation-and-test week instead.

**4. Session objectives** — existing titles preserved:
`Upper Body Band` · `Lower Body Band` · `Full Body Band` · `Core + Carry` · `Band Burnout`.

**5. Exercise selection principles**
Band compounds first (`Seated Band Row`, `Band Pull-Apart`, `Banded Good Morning`, `Band Pallof Press`), then bodyweight compounds (`Goblet Squat` without weight, `Push-Up`, `Reverse Lunge`), then band isolation (`Band Bicep Curl`, `Band Tricep Extension`), then trunk. Anchor direction is checked before every set.

**6. Progression strategy**
Band resistance → reps → rounds. **Never more than one of the three in a week** (R6 identifies load control as the main difficulty with elastic resistance, so the program advances the variable it can actually measure). Intensity is prescribed by effort in `notes` ("finish the last rep with 2 in reserve"), not by kilograms.

**7. Recovery strategy**
Two rest days weekly. No deload; week 4 consolidates. Because rest intervals are short, sessions are capped at 6 work exercises to keep total session time near 25 minutes.

**8. Equipment alternatives**
Preferred: one loop band plus one long band with handles. With only a loop band: presses become `Push-Up` variations, rows become `Superman`/`Rear Delt Fly`, curls use the loop underfoot. With only a long band: anchor to a door or a heavy table leg (checked first) and use it for every pull and press.

**9. Safety considerations**
Inspect the band for nicks and fraying before every session — a damaged band can snap. Never let go of a band under tension. Anchor must be tested with a light pull before loading it. Keep constant tension; do not let the band go slack and snap back. Band across the upper back in `Banded Good Morning` must sit on the traps, not the neck.

**10. Content gaps requiring development**
Full introduction, including an explicit statement that band training is prescribed by **resistance level and effort, not by weight** (R6). Warm-up and cooldown rows across all 20 days. Round-based progression notes. Real week-to-week differentiation. Structured instruction rewrite. Correct the "video demonstrations" bullet. Band-level naming convention (`light` / `medium` / `heavy`) must be defined once and used everywhere.

---

## BP-06 · 4-Week Upper Body Dumbbell Sculpt

**1. Program identity**
`cmv5xcon300e18ukw0yz2maf0` · PROGRAM · $14.99 · INTERMEDIATE · 4 weeks · **4 days/week** · dumbbells, bench · home or gym · currently 4 wk / 16 days / 80 entries.

**2. Training methodology**
*Four-day upper-body hypertrophy split.* The only four-day program in the catalog and the only one that never trains legs — which is what distinguishes it from BP-04. Push, pull, shoulders-and-arms and an integrated upper day are separated so each pattern gets a fresh session rather than sharing one with lower-body work.

**3. Weekly structure**

| Week | Title | Objective | Change |
|---|---|---|---|
| 1 | **Foundation** | Scapular control and pressing mechanics | 3 sets, RPE 6–7 |
| 2 | **Build** | Add work to push and pull | +1 set on D1/D2 primary lifts only |
| 3 | **Volume** | Accumulate upper-body hard sets | +1 set on D3/D4, accessory rest −15 s |
| 4 | **Peak & Retest** | Prove it, land safely | Top set on each compound; accessories drop one set (a small taper consistent with R11 applied to a short block); retest week 1 rep targets |

**4. Session objectives** — existing titles preserved:
`Push Day` · `Pull Day` · `Shoulders + Arms` · `Upper + Core`.

**5. Exercise selection principles**
Multi-joint before single-joint (R7): `Dumbbell Bench Press` → `Incline Dumbbell Press` → `Dumbbell Chest Fly`; `Dumbbell Bent-Over Row` / `Chest-Supported Dumbbell Row` → `Rear Delt Fly`; `Dumbbell Shoulder Press` / `Arnold Press` → `Lateral Raise` → `Front Raise`. Every pressing day is paired with a pulling day in the same week so shoulder health is maintained.

**6. Progression strategy**
§2.2 — one variable per week. Four weeks means no deload; week 4 trims accessory volume while holding compound intensity, so the customer finishes stronger rather than flatter.

**7. Recovery strategy**
Three rest days weekly — the highest recovery availability of any program in the catalog, which is what makes a four-day upper split viable at intermediate level within the 3–4 d/wk frequency range in R1. No deload needed in four weeks.

**8. Equipment alternatives**
Dumbbells + bench required. `Bench Dip` → floor dip; `Incline Dumbbell Press` → floor press; `Chest-Supported Dumbbell Row` → bent-over row if no incline bench; `Arnold Press` → `Dumbbell Shoulder Press`. Sessions are deliverable with one pair of dumbbells and a chair.

**9. Safety considerations**
Shoulder blades pinned and depressed during presses; do not let the ribs flare. Rows are driven by the elbows, not the hands. `Front Raise` uses light load — the front delt is already worked in every press. Elbows stay slightly bent in `Dumbbell Chest Fly`; do not hyperextend the shoulder at the bottom. No behind-neck pressing.

**10. Content gaps requiring development**
Full introduction. Warm-up and cooldown rows across all 16 days. Real week-to-week differentiation (all four weeks currently identical). Week 4 mini-taper. RPE/tempo/substitution notes. Structured instruction rewrite. Correct the "video demonstrations" bullet. Note the existing 4-days/week figure in `Product.daysPerWeek` is already correct and must be preserved.

---

## BP-07 · 8 Weeks Dumbbell Full Body Sculpt — `cmw7bmx5e0035rhkwsydkol5t`

**1. Program identity** · `isTemplate=true`, `isSellable=false`, `price=null`, `duration=null`, `difficulty=null`, **0 weeks / 0 days / 0 entries**, `description=null`, `features=[]`, **no `Product` row** — therefore invisible to customers and unpurchasable.

**2. Assessment.** 67 % token similarity with BP-04. It has no description, no product, no price, no assignments, no completions and no entitlements. Building it would put a second six/eight-week full-body dumbbell program into the catalog next to BP-04 with no differentiator and no price.

**3. Recommendation — RETIRE.** Delete the row (safe: no `ClientProgram`, no `WorkoutCompletion`, no `Product` link) or leave it unlisted. If an eight-week full-body program is genuinely wanted as a distinct product, it must first be given a `Product` row, a price, a bundle decision and a methodology that differs from BP-04 (e.g. barbell-inclusive, or a strength-focus rather than strength-endurance focus) — that is a product decision, not a content decision.

**4. Alternative blueprint (only if you choose to develop it).** Eight weeks, dumbbells + barbell, strength focus rather than BP-04's strength-endurance: `Foundation` / `Build` / `Volume` / **`Deload` (wk 4)** / `Intensify` / `Peak` / `Overreach` / `Consolidate` (wk 8), five days as `Lower Strength` · `Upper Strength` · `Full Body Power` · `Full Body Volume` · `Conditioning + Core`, 4–6 work exercises per session with longer rest (60–90 s) than BP-04.

**5. Content gaps** — everything. This is an empty program.

---

## BP-08 · 6 Weeks Dumbbells Full Body Sculpt — `cmw7boaxz003crhkwbuxhgcaf`

**1. Program identity** · Identical state to BP-07: no product, no price, no duration, no difficulty, **0 weeks / 0 days / 0 entries**, `description=null`.

**2. Assessment.** 67 % token similarity with BP-04, plus a grammatical error in the title ("Dumbbells" plural). It is a near-certain duplicate created during an earlier content pass.

**3. Recommendation — RETIRE.** Same safety analysis as BP-07: nothing references this row.

**4. Content gaps** — everything.

---

## BP-09 · 30 Days Glute Growth Challenge — `cmw7bzt5w0049rhkwyjc2c5yq`

**1. Program identity** · `isSellable=false`, no `Product`, `duration=null`, `difficulty=null`, **2 weeks that contain 0 days**, `description="For women who want to grow round and firm glutes"`, `features=[]`.

**2. Assessment.** The *concept* is distinct and fills a real gap: BP-01 is a 3-week band-only activation challenge, BP-02 is an 8-week intermediate barbell/dumbbell hypertrophy block. There is nothing between them — a **beginner glute challenge using bodyweight, a band and an optional dumbbell, running four weeks**, is a genuinely different product rather than a duplicate. The two existing empty week rows must be removed as part of any rebuild.

**3. Recommendation — DEVELOP, conditional on it receiving a `Product` row.** Without a product it cannot be sold, cannot appear in the catalog and cannot be bundled; developing it as-is would produce content nobody can reach.

**4. Blueprint**

- **Identity:** CHALLENGE · 4 weeks · 5 days/week · BEGINNER · equipment: mat, optional loop band, optional dumbbell · price and slug decided by you.
- **Methodology:** *Glute development through three loading styles.* Each week progresses from activation to compound loading to metabolic density — different again from BP-01 (activation only) and BP-02 (barbell hypertrophy).
- **Weekly structure:**

| Week | Title | Objective |
|---|---|---|
| 1 | **Foundation** | Activation and pattern mastery, bodyweight and light band |
| 2 | **Build** | Add the dumbbell to hinge and squat patterns |
| 3 | **Volume** | Add the band to compound days; circuits of 3 rounds |
| 4 | **Peak & Retest** | Strongest band/dumbbell; retest week 1 rep targets |

- **Session objectives:** `Glute Activation` · `Squat + Hinge` · `Unilateral Burn` · `Core + Carry` · `Metabolic Finish`.
- **Selection principles:** glute-primary; two unilateral movements per week (the differentiator from a generic lower-body day); `Lateral Lunge` and `Curtsy Lunge` used here; compounds first, isolation last.
- **Progression:** bodyweight → band → dumbbell, one step per week; then reps; then rounds.
- **Recovery:** two rest days weekly; four weeks is too short for a deload, so week 4 consolidates.
- **Equipment alternatives:** fully deliverable with no equipment (bodyweight only); band optional; dumbbell optional — each substitution named in `notes`.
- **Safety:** band placement above the knees; hinge mechanics before load; unilateral work starts with the weaker side; DOMS vs pain distinction stated explicitly; no body-composition or shape promise in the copy — the current description's "grow round and firm glutes" must be rewritten to a strength-and-muscle-endurance outcome.
- **Gaps:** everything, plus the two empty week rows to remove, plus a new `Product` row (price, slug, duration label, days/week, focus, bundle membership) — all requiring your approval.

---

## BP-10 · NoMi 8 Weeks Signature Program — `cmwceu3zc0056rhkwm11aasy3`

**1. Program identity** · `isSellable=false`, no `Product`, **0 weeks / 0 days / 0 entries**, `description="Program for weight loss, and muscle building. Consisting 8 weeks workout plan + Diet Recommendation"`, `features=[]`.

**2. Assessment.** The most ambitious concept in the catalog and the one with the largest scope problem. It promises a "Diet Recommendation", which is out of scope: there is no catalog-facing meal-plan mechanism (`PersonalizedNutritionPlan` is coach-assigned, not part of a purchased program), and the content rules prohibit restrictive diet plans, supplement prescriptions and body-transformation promises. The workout side, however, is a legitimate and distinct product — the catalog's only **concurrent** program (strength *and* conditioning *and* mobility together), which no other program offers.

**3. Recommendation — DEVELOP with a scope correction.** Reframe from "weight loss + diet plan" to **"general fitness: build strength, improve conditioning, learn balanced-eating principles"**. Conditional on receiving a `Product` row.

**4. Blueprint**

- **Identity:** PROGRAM · 8 weeks · 5 days/week · BEGINNER-TO-INTERMEDIATE · equipment: dumbbells, loop band, mat · price and slug decided by you.
- **Methodology:** *Concurrent training for general fitness.* Three strength sessions plus two conditioning sessions per week, with mobility folded into every warm-up and cooldown. This is the broadest-equipment, broadest-audience program in the catalog and is positioned as the flagship.
- **Weekly structure:**

| Week | Title | Objective |
|---|---|---|
| 1 | **Foundation** | Learn all movement patterns; establish the habit |
| 2 | **Build** | Add a set to the strength days only |
| 3 | **Volume** | Add density to conditioning; rest −10 s |
| 4 | **Deload** | ~40 % fewer sets, reps held, rest +30 s, RPE 5 |
| 5 | **Intensify** | Return to week 3 with the 2–10 % load rule |
| 6 | **Peak** | Top set on each compound |
| 7 | **Overreach** | Highest week of the block |
| 8 | **Consolidate** | Drop to week 1–2 volume; retest; set the next goal |

- **Session objectives:** `Strength A` · `Conditioning` · `Strength B` · `Core + Mobility` · `Full Body + Finisher`.
- **Selection principles:** six movement patterns across the strength days; conditioning alternates steady (`March in Place`, `Lateral Step Touch`) and intervals (`High Knees`, `Skater`, `Step-Back Burpee`); `Core + Mobility` day is deliberately low-load.
- **Progression:** §2.2 with a deload at week 4 and consolidation at week 8 (R11/R12).
- **Recovery:** two rest days weekly; deload week 4; reactive rule in the education text.
- **Equipment alternatives:** every exercise has a band or bodyweight substitute; the program is deliverable with a mat alone, and the copy says so.
- **Safety:** standard movement safety plus an explicit nutrition-scope statement — the program includes general education on hydration, balanced plates, protein at each meal and eating around training, and **does not** include a meal plan, calorie target, supplement protocol or any medical nutrition advice. Anyone with a medical condition, disordered-eating history or specific dietary need is directed to a registered dietitian or physician.
- **Gaps:** everything, plus removal of the diet-plan promise, plus a new `Product` row requiring your approval.

---

## BP-11 · Stripe Payment Test — `cmw22nhso0000h40oqlqb699d`

**1. Program identity** · CHALLENGE-priced test product · `Product slug=stripe-payment-test` · `status=PUBLISHED` · $0.50 · `sortOrder=999` · 0 weeks / 0 days / 0 entries · description explicitly states no workouts are included.

**2. Assessment.** It is working as designed *as a test*, but it is **publicly listed in the production storefront**, appears in search and in the "14 Programs Available" count, and is discoverable by real customers. Two pending orders already reference it.

**3. Recommendation — UNPUBLISH.** Set `Product.status` to `DRAFT` (admin-only, preserves history) or `ARCHIVED` (hidden from sale, preserves order/entitlement FKs). Keep the `Program` and `Product` rows — do not delete them, because pending orders reference the product ID. This is a one-field change and is the lowest-risk item in the whole plan.

**4. Content work required:** none. This is intentionally an empty program.

---

## BP-O1 · 6-Week Dumbbell Glute Growth — **no Program row** (product `6-week-dumbbell-glute-growth`)

**1. Program identity** · Product is `PUBLISHED`, $19.99, 6 weeks, 5 days/week, equipment `["Dumbbells"]`, **`programId = NULL`**, members of `lower-body-bundle` and `complete-nomitips-bundle`. Live page renders "— Workouts / — Weeks".

**2. Distinct position.** BP-02 is 8 weeks with a barbell and is intermediate. This is **6 weeks, dumbbell-only, home-friendly** — a different equipment constraint and a shorter commitment at a lower price. That is a defensible difference, but only if the program actually exists.

**3. Recommendation — CREATE the Program row and link it** (decision #2), owned by `nomitipscoaching@gmail.com`, then apply this blueprint.

- **Methodology:** *Dumbbell lower-body hypertrophy, home-friendly.* Four lower-body sessions plus one upper maintenance session — the same split logic as BP-02 but every barbell movement replaced with a dumbbell equivalent, so no exercise requires a rack.
- **Weekly structure:** `Foundation` (wk 1) · `Build` (wk 2) · `Volume` (wk 3) · **`Deload` (wk 4)** · `Intensify` (wk 5) · `Peak` (wk 6).
- **Session objectives:** `Lower Heavy` · `Upper Maintenance` · `Glute Volume` · `Lower Unilateral` · `Glute + Core`.
- **Selection:** `Goblet Squat`, `Dumbbell Romanian Deadlift`, `Dumbbell Hip Thrust`, `Bulgarian Split Squat`, `Reverse Lunge`, `Walking Lunge`, `Step-Up`, `Calf Raise`, `Lying Leg Curl`, `Leg Extension` + upper maintenance day using `Dumbbell Bench Press`, `Single-Arm Dumbbell Row`, `Lateral Raise`, `Dumbbell Bicep Curl`.
- **Progression / recovery:** as BP-02 — deload week 4, one variable per week, consolidation in week 6.
- **Equipment alternatives:** a bench is optional (hip thrusts from the floor); a barbell, if owned, is offered as an upgrade on the heavy day.
- **Safety:** as BP-02, plus an explicit note that dumbbells must be可控 — a customer training alone at home should not work to failure on `Bulgarian Split Squat`.
- **Gaps:** the entire Program row, plus a guard so this cannot be orphaned again (see T4).

## BP-O2 · 6-Week Glutes & Quads Builder — **no Program row** (product `6-week-glutes-and-quads-builder`)

**1. Program identity** · Product `PUBLISHED`, $19.99, 6 weeks, 5 days/week, equipment `["Dumbbells","Leg press machine"]`, **`programId = NULL`**, member of `lower-body-bundle` and `complete-nomitips-bundle`.

**2. Distinct position.** The other two lower-body products are glute-*emphasis*. This one is explicitly **glutes *and* quads** — a balanced lower-body builder, and the only product in the catalog that lists a machine. Those two facts are enough to justify it as a separate product rather than a duplicate.

**3. Recommendation — CREATE the Program row and link it** (decision #2), then apply this blueprint.

- **Methodology:** *Balanced lower-body hypertrophy alternating quad-emphasis and glute-emphasis days*, with an upper maintenance day and a carry/conditioning day. The alternating emphasis is what separates it from O1's glute-only focus.
- **Weekly structure:** `Foundation` · `Build` · `Volume` · **`Deload` (wk 4)** · `Intensify` · `Peak`.
- **Session objectives:** `Quad Emphasis` · `Glute Emphasis` · `Upper Maintenance` · `Posterior + Carry` · `Quads + Glutes Metabolic`.
- **Selection:** quads — `Leg Press`, `Leg Extension`, `Goblet Squat`, `Sumo Squat`, `Reverse Lunge`; glutes — `Dumbbell Hip Thrust`, `Barbell Hip Thrust` (or dumbbell), `Banded Kickback`, `Curtsy Lunge`, `Lateral Lunge` (currently unused); posterior — `Dumbbell Romanian Deadlift`, `Lying Leg Curl`, `Calf Raise`; carry — `Farmer-style` walking lunges and `Wall Sit` as the isometric finisher.
- **Progression / recovery:** as O1.
- **Equipment alternatives:** leg press is **optional** — `Goblet Squat` substitutes directly, and the copy must say so, since the equipment list currently implies a machine is required.
- **Safety:** machine setup (seat height so knees reach ~90°, never locking out hard at the top); unilateral work starts with the weaker side; hinge safety as BP-02.
- **Gaps:** the entire Program row, plus correction of the equipment list to make the leg press optional, plus the orphan guard (T4).

---

# PART 4 — Methodology differentiation check

Required by the brief: *a cardiovascular program must not be structured like a resistance program, and a glute program must not be a full-body program with a different title.*

| | BP-01 | BP-02 | BP-03 | BP-04 | BP-05 | BP-06 | O1 | O2 |
|---|---|---|---|---|---|---|---|---|
| Primary quality trained | motor control | hypertrophy | trunk control | strength-endurance | circuit conditioning | upper hypertrophy | lower hypertrophy | balanced lower |
| Session length | ~22 min | ~45 min | ~18 min | ~40 min | ~25 min | ~40 min | ~42 min | ~42 min |
| Session structure | circuits of 5 | straight sets | isometric + pairs | straight sets | rounds | straight sets | straight sets | straight sets |
| Rest interval | 30–60 s | 60–120 s | 30–45 s | 45–90 s | **30–45 s** | 45–90 s | 60–120 s | 45–90 s |
| Load variable | band level | barbell/DB load | hold time | DB load | **band level → rounds** | DB load | DB load | DB + machine |
| Weekly split | same 5 titles | 5 distinct roles | 5 categories | 5 rotating emphasis | 5 full-body | 4-way upper | 4 lower + 1 upper | 5 alternating emphasis |
| Deload | n/a (3 wk) | **wk 4** | n/a (3 wk) | **wk 4** | n/a (4 wk) | mini-taper wk 4 | **wk 4** | **wk 4** |

Six genuinely different methodologies across six populated programs, plus two distinct lower-body blueprints for the orphans. The cardio programs (30-Day Low-Impact Cardio Burn, 14-Day Tabata) belong to the other coach and are out of scope, so no cardiovascular blueprint is written here — and no resistance blueprint imitates one.

---

# PART 5 — Decisions (RESOLVED)

**User directive (Phase 2 gate):** *"implement what is best for this website but stripe-payment already exists and work"*

| # | Decision | Resolution |
|---|---|---|
| 1 | **Seed-coach programs** (30-Day Cardio, 14-Day Tabata) | **Out of scope** — not modified (ownership enforcement preserved). |
| 2 | **Orphan products O1/O2** | **Create + link** Program rows under the target coach, then fill per BP-O1/BP-O2. |
| 3 | **Empty programs B7–B10** | **Retire B7/B8** (duplicates of BP-04), **develop B9/B10** (both fill real gaps). |
| 4 | **`stripe-payment-test`** | **LEAVE EXACTLY AS-IS** — user confirms it already exists and works. No status change, no content work. |
| 5 | **Phase 3 safety net** | Neon staging branch if API key is available; otherwise `pg_dump` backup of the production DB before any write. |
| 6 | **"Video demonstrations" feature copy** | **Correct the copy** on all catalog products to describe what actually exists. |
| 7 | **`Exercise.instructions` format** | **Existing single column**, fixed labelled structure (`Set-up / Execution / Breathing / Watch for / Easier / Harder`). |
| 8 | **Product rows for B9/B10** | **Yes** — B9 `30 Days Glute Growth Challenge` at $14.99, B10 `NoMi 8 Weeks Signature Program` at $29.99; published standalone; **bundle membership unchanged** (no silent price/value changes to existing bundles). |

Original question list (for the record):

| # | Decision | Options | My recommendation |
|---|---|---|---|
| 1 | **Seed-coach programs** (30-Day Cardio, 14-Day Tabata) | In scope / out of scope | **Out of scope** — ownership is enforced app-side, and modifying them would break the "do not modify other coaches' programs" rule. Their presence in all three bundles is noted as a known limitation. |
| 2 | **Orphan products O1/O2** | Create Program rows under the target coach and link / unpublish them | **Create and link** — both are inside two bundles, so unpublishing would hollow out `lower-body-bundle` and `complete-nomitips-bundle`. |
| 3 | **Empty programs B7–B10** | Retire B7/B8, develop B9/B10 / develop all four / retire all four | **Retire B7 and B8** (duplicates), **develop B9 and B10** (both fill real gaps) — each only if it gets a `Product` row. |
| 4 | **`stripe-payment-test`** | Set to `DRAFT` / `ARCHIVED` / leave published | ~~Set to `DRAFT`~~ — **superseded: leave published** per user. |
| 5 | **Environment for Phase 3** | Create a Neon staging branch / write to production under a pre-write backup | **Create a Neon branch first** — `NEON_BRANCH=production` is what local `.env` points at, so there is currently no safe place to rehearse. |
| 6 | **"Video demonstrations" feature copy** | Correct the copy / source real media | **Correct the copy now, add media later** — the claim is false today on all 10 catalog items, and no verified per-exercise demonstrations exist. |
| 7 | **`Exercise.instructions` format** | Write structured sections into the existing single text column / request a schema change | **Use the existing column** with a fixed labelled structure — no migration, no approval overhead, and the field already renders on both the client page and the workout player. |

---

**DONE — Phases 2 and 3 complete (2026-11-13).** Phase 2 wrote the reviewable content package (`prisma/content-v2/`, validator: `scripts/phase2-validate.ts`). Phase 3 applied it to production (`scripts/phase3-load.ts`, dry-run by default / `--apply` to write) under the decision-#5 `pg_dump` safety net: 91 exercise instruction blocks (4 new), 10 products (2 created: B9/B10), 10 programs (2 created: O1/O2), 52 weeks / 256 days / 2,569 rows rebuilt, B7/B8 retired, bundle membership untouched, `stripe-payment-test` untouched. T4 orphan guard added to both `deleteProgram` implementations. Residual item: the two other-coach products (`30-day-low-impact-cardio-burn`, `14-day-tabata-and-cardio-challenge`) still carry "video demonstrations" feature copy — left alone per decision #1; correcting them is a decision-#6 follow-up.
