import type { ExerciseInstruction, ProgramV2 } from "./types";

import { PRODUCT_COPY } from "./products";
import { EXERCISES_CORE_CARDIO } from "./exercises-core-cardio";
import { EXERCISES_LOWER } from "./exercises-lower";
import { EXERCISES_UPPER } from "./exercises-upper";

import BP01 from "./bp01";
import BP02 from "./bp02";
import BP03 from "./bp03";
import BP04 from "./bp04";
import BP05 from "./bp05";
import BP06 from "./bp06";
import BP09 from "./bp09";
import BP10 from "./bp10";
import O1 from "./o1";
import O2 from "./o2";

/**
 * Phase 2 content package — single entry point.
 *
 * Everything a review or the Phase 3 loader needs, in one import:
 * - `PRODUCT_COPY` — final storefront copy for all 10 NomiTips products.
 * - `PROGRAMS` — the 10 program drafts (B7/B8 retired; O1/O2 newly built).
 * - `EXERCISES` — labelled instruction blocks for the shared exercise library.
 *
 * Nothing here touches the database. `scripts/phase3-load.ts` applies the
 * package after the Phase 3 safety net (backup / staging branch) is in place.
 */

export const PROGRAMS: ProgramV2[] = [
  BP01,
  BP02,
  BP03,
  BP04,
  BP05,
  BP06,
  BP09,
  BP10,
  O1,
  O2,
];

export const EXERCISES: ExerciseInstruction[] = [
  ...EXERCISES_LOWER,
  ...EXERCISES_UPPER,
  ...EXERCISES_CORE_CARDIO,
];

export { PRODUCT_COPY };
export { BP01, BP02, BP03, BP04, BP05, BP06, BP09, BP10, O1, O2 };
export * from "./types";
