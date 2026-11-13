import type { ProgramV2 } from "./types";
import { cd, ex, wu } from "./warmup";

/**
 * BP-06 · 4-Week Upper Body Dumbbell Sculpt (docs/PHASE1-PROGRAM-BLUEPRINTS.md)
 * 4 weeks × 4 days · upper-body hypertrophy split, no lower-body work.
 * Push / Pull / Shoulders + Arms / Upper + Core — every week trains both a
 * pressing and a pulling day so shoulder health is never traded for volume.
 * Four weeks is too short for a deload, so week 4 is a mini-taper-and-retest:
 * top set on each compound, accessories drop one set.
 * Every session: `wu("upper")` + 5–6 main rows + `cd("upper")`.
 */

export const BP06: ProgramV2 = {
  slug: "4-week-upper-body-dumbbell-sculpt",
  title: "4-Week Upper Body Dumbbell Sculpt",
  weeks: [
    {
      title: "Foundation",
      days: [
        {
          title: "Push Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "RPE 6–7 · ~3 reps in reserve · shoulder blades pinned, ribs down" }),
            ex("Incline Dumbbell Press", 3, 12, 60, { notes: "RPE 6–7 · or floor press if you have no incline bench" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "RPE 6–7 · scapular control · no arching the lower back" }),
            ex("Lateral Raise", 3, 15, 45, { notes: "RPE 6–7 · light load · lead with the elbows, no swinging" }),
            ex("Tricep Kickback", 3, 12, 45, { notes: "RPE 6–7 · elbows high and still · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Pull Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "RPE 6–7 · flat back · drive the elbows past the ribs" }),
            ex("Chest-Supported Dumbbell Row", 3, 12, 60, { notes: "RPE 6–7 · or a bent-over row if you have no incline bench" }),
            ex("Rear Delt Fly", 3, 15, 45, { notes: "RPE 6–7 · tiny bend in the elbows · lead with the elbows" }),
            ex("Dumbbell Bicep Curl", 3, 12, 45, { notes: "RPE 6–7 · no swinging · full range both directions" }),
            ex("Hammer Curl", 3, 12, 45, { notes: "RPE 6–7 · neutral grip · elbows pinned to the sides" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Shoulders + Arms",
          exercises: [
            ...wu("upper"),
            ex("Arnold Press", 3, 12, 60, { notes: "RPE 6–7 · smooth rotation · or Dumbbell Shoulder Press if it feels awkward" }),
            ex("Front Raise", 3, 12, 45, { notes: "RPE 6–7 · light load · the front delt already works in every press" }),
            ex("Lateral Raise", 3, 15, 45, { notes: "RPE 6–7 · lead with the elbows · no swinging" }),
            ex("Overhead Dumbbell Tricep Extension", 3, 12, 45, { notes: "RPE 6–7 · elbows point forward · ribs down" }),
            ex("Dumbbell Bicep Curl", 3, 12, 45, { notes: "RPE 6–7 · supinate at the top · no swinging" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Push-Up", 3, 12, 45, { notes: "RPE 6–7 · body in one line · or incline push-up on a bench" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · brace on a chair · pull the elbow past the ribs" }),
            ex("Bench Dip", 3, 12, 45, { notes: "RPE 6–7 · or floor dip · shoulders down, no shrugging" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "RPE 6–7 · breathe steadily · hips level, ribs down" }),
            ex("Dead Bug", 3, 10, 45, { notes: "RPE 6–7 · lower back pressed down · opposite arm and leg" }),
            ...cd("upper"),
          ],
        },
      ],
    },
    {
      title: "Build",
      days: [
        {
          title: "Push Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · ~2 reps in reserve" }),
            ex("Incline Dumbbell Press", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · or floor press if you have no incline bench" }),
            ex("Dumbbell Shoulder Press", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · scapular control" }),
            ex("Lateral Raise", 3, 15, 45, { notes: "Hold week 1 reps · light load · lead with the elbows" }),
            ex("Tricep Kickback", 3, 12, 45, { notes: "Hold week 1 reps · elbows high and still" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Pull Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bent-Over Row", 4, 10, 75, { notes: "+1 set vs week 1 · RPE 7 · drive the elbows past the ribs" }),
            ex("Chest-Supported Dumbbell Row", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · chest on the bench" }),
            ex("Rear Delt Fly", 3, 15, 45, { notes: "Hold week 1 reps · lead with the elbows" }),
            ex("Dumbbell Bicep Curl", 3, 12, 45, { notes: "Hold week 1 reps · no swinging" }),
            ex("Hammer Curl", 3, 12, 45, { notes: "Hold week 1 reps · neutral grip" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Shoulders + Arms",
          exercises: [
            ...wu("upper"),
            ex("Arnold Press", 3, 12, 60, { notes: "Hold week 1 reps · RPE 7 · smooth rotation" }),
            ex("Front Raise", 3, 12, 45, { notes: "Hold week 1 reps · light load · no swinging" }),
            ex("Lateral Raise", 3, 15, 45, { notes: "Hold week 1 reps · lead with the elbows" }),
            ex("Overhead Dumbbell Tricep Extension", 3, 12, 45, { notes: "Hold week 1 reps · elbows point forward" }),
            ex("Dumbbell Bicep Curl", 3, 12, 45, { notes: "Hold week 1 reps · supinate at the top" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Push-Up", 3, 12, 45, { notes: "Hold week 1 reps · RPE 7 · body in one line" }),
            ex("Single-Arm Dumbbell Row", 3, 10, 60, { notes: "Each side · hold week 1 reps · elbow past the ribs" }),
            ex("Bench Dip", 3, 12, 45, { notes: "Hold week 1 reps · or floor dip · no shrugging" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Hold week 1 time · breathe steadily · hips level" }),
            ex("Dead Bug", 3, 10, 45, { notes: "Hold week 1 reps · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
      ],
    },
    {
      title: "Volume",
      days: [
        {
          title: "Push Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · shoulder blades pinned" }),
            ex("Incline Dumbbell Press", 3, 12, 60, { notes: "Hold week 2 reps · RPE 7 · or floor press if you have no incline bench" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Rest −15s vs week 2 · RPE 7 · no arching the lower back" }),
            ex("Lateral Raise", 3, 15, 30, { notes: "Rest −15s vs week 2 · light load · lead with the elbows" }),
            ex("Tricep Kickback", 3, 12, 30, { notes: "Rest −15s vs week 2 · elbows high and still" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Pull Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bent-Over Row", 4, 10, 75, { notes: "Hold week 2 volume · RPE 7 · flat back" }),
            ex("Chest-Supported Dumbbell Row", 3, 12, 75, { notes: "Hold week 2 reps · chest on the bench" }),
            ex("Rear Delt Fly", 3, 15, 30, { notes: "Rest −15s vs week 2 · lead with the elbows" }),
            ex("Dumbbell Bicep Curl", 3, 12, 30, { notes: "Rest −15s vs week 2 · no swinging" }),
            ex("Hammer Curl", 3, 12, 30, { notes: "Rest −15s vs week 2 · neutral grip" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Shoulders + Arms",
          exercises: [
            ...wu("upper"),
            ex("Arnold Press", 4, 12, 60, { notes: "+1 set vs week 2 · RPE 7 · smooth rotation" }),
            ex("Front Raise", 4, 12, 45, { notes: "+1 set vs week 2 · light load · no swinging" }),
            ex("Lateral Raise", 4, 15, 30, { notes: "+1 set, rest −15s vs week 2 · lead with the elbows" }),
            ex("Overhead Dumbbell Tricep Extension", 4, 12, 30, { notes: "+1 set, rest −15s vs week 2 · elbows point forward" }),
            ex("Dumbbell Bicep Curl", 4, 12, 30, { notes: "+1 set, rest −15s vs week 2 · supinate at the top" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Push-Up", 4, 12, 45, { notes: "+1 set vs week 2 · RPE 7 · body in one line" }),
            ex("Single-Arm Dumbbell Row", 4, 10, 60, { notes: "Each side · +1 set vs week 2 · elbow past the ribs" }),
            ex("Bench Dip", 4, 12, 30, { notes: "+1 set, rest −15s vs week 2 · or floor dip" }),
            ex("Plank", 4, 45, 30, { seconds: true, notes: "+1 set vs week 2 · rest held at 30s · hips level" }),
            ex("Dead Bug", 4, 10, 30, { notes: "+1 set, rest −15s vs week 2 · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
      ],
    },
    {
      title: "Peak & Retest",
      days: [
        {
          title: "Push Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bench Press", 1, 6, 90, { notes: "Top set · RPE 8–9 · heavier than week 3 · own the rep first" }),
            ex("Dumbbell Bench Press", 3, 10, 75, { notes: "Back-off · RPE 7 · retest week 1's 10 reps at week 3 load" }),
            ex("Incline Dumbbell Press", 3, 12, 60, { notes: "Peak · top set on set 1, then back-off ~10% · or floor press" }),
            ex("Dumbbell Shoulder Press", 3, 12, 45, { notes: "Peak · top set then back-off · scapular control · ribs down" }),
            ex("Lateral Raise", 2, 15, 30, { notes: "Taper · one set less than week 3 · hold the load" }),
            ex("Tricep Kickback", 2, 12, 30, { notes: "Taper · one set less than week 3 · squeeze at full extension" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Pull Day",
          exercises: [
            ...wu("upper"),
            ex("Dumbbell Bent-Over Row", 1, 6, 90, { notes: "Top set · RPE 8–9 · heavier than week 3 · flat back" }),
            ex("Dumbbell Bent-Over Row", 3, 10, 75, { notes: "Back-off · RPE 7 · retest week 1's 10 reps at week 3 load" }),
            ex("Chest-Supported Dumbbell Row", 3, 12, 75, { notes: "Peak · top set on set 1, then back-off ~10% · chest on the bench" }),
            ex("Rear Delt Fly", 2, 15, 30, { notes: "Taper · one set less than week 3 · lead with the elbows" }),
            ex("Dumbbell Bicep Curl", 2, 12, 30, { notes: "Taper · one set less than week 3 · no swinging" }),
            ex("Hammer Curl", 2, 12, 30, { notes: "Taper · one set less than week 3 · neutral grip" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Shoulders + Arms",
          exercises: [
            ...wu("upper"),
            ex("Arnold Press", 1, 6, 90, { notes: "Top set · RPE 8–9 · heavier than week 3 · smooth rotation" }),
            ex("Arnold Press", 3, 12, 60, { notes: "Back-off · RPE 7 · retest week 1's 12 reps at week 3 load" }),
            ex("Front Raise", 3, 12, 45, { notes: "Taper · one set less than week 3 · light load" }),
            ex("Lateral Raise", 3, 15, 30, { notes: "Taper · one set less than week 3 · lead with the elbows" }),
            ex("Overhead Dumbbell Tricep Extension", 3, 12, 30, { notes: "Taper · one set less than week 3 · elbows point forward" }),
            ex("Dumbbell Bicep Curl", 3, 12, 30, { notes: "Taper · one set less than week 3 · supinate at the top" }),
            ...cd("upper"),
          ],
        },
        {
          title: "Upper + Core",
          exercises: [
            ...wu("upper"),
            ex("Push-Up", 1, 8, 60, { notes: "Top set · RPE 8–9 · heavier than week 3 · body in one line" }),
            ex("Push-Up", 3, 12, 45, { notes: "Final day · retest week 1's 12 reps at week 3 load" }),
            ex("Single-Arm Dumbbell Row", 4, 10, 60, { notes: "Each side · top set on set 1, then back-off · retest week 1's 10 reps" }),
            ex("Bench Dip", 3, 12, 30, { notes: "Taper · one set less than week 3 · or floor dip" }),
            ex("Plank", 3, 45, 30, { seconds: true, notes: "Final day · retest week 1's 45s · breathe steadily, hips level" }),
            ex("Dead Bug", 3, 10, 30, { notes: "Final day · retest week 1's 10 reps · lower back pressed down" }),
            ...cd("upper"),
          ],
        },
      ],
    },
  ],
};

export default BP06;
