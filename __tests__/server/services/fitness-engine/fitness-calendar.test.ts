import { describe, it, expect } from "vitest";
import {
  generateCalendar,
  rescheduleEvent,
  skipWorkout,
} from "@/server/services/fitness-engine/fitness-calendar";

describe("generateCalendar", () => {
  it("generates a 2-week calendar", () => {
    const weeks = generateCalendar({
      startDate: new Date("2024-01-01"),
      programDays: [
        { dayNumber: 1, title: "Chest Day", muscleGroups: ["CHEST"] },
        { dayNumber: 2, title: "Back Day", muscleGroups: ["BACK"] },
      ],
      completions: [],
      restDays: [0, 6],
      weeksToShow: 2,
    });
    expect(weeks.length).toBe(2);
    expect(weeks[0]!.days.length).toBe(7);
  });

  it("marks rest days", () => {
    const weeks = generateCalendar({
      startDate: new Date("2024-01-01"),
      programDays: [],
      completions: [],
      restDays: [0, 6],
      weeksToShow: 1,
    });
    const restEvents = weeks[0]!.days.flatMap((d) => d.events.filter((e) => e.type === "rest"));
    expect(restEvents.length).toBe(2);
  });

  it("marks completed workouts", () => {
    const weeks = generateCalendar({
      startDate: new Date("2024-01-01"),
      programDays: [
        { dayNumber: 1, title: "Chest Day", muscleGroups: ["CHEST"] },
      ],
      completions: [{ completedAt: new Date("2024-01-01"), dayNumber: 1 }],
      restDays: [0, 6],
      weeksToShow: 1,
    });
    const workoutEvents = weeks[0]!.days.flatMap((d) => d.events.filter((e) => e.type === "workout"));
    expect(workoutEvents.some((e) => e.completed)).toBe(true);
  });
});

describe("rescheduleEvent", () => {
  it("moves an event to a new date", () => {
    const weeks = generateCalendar({
      startDate: new Date("2024-01-01"),
      programDays: [
        { dayNumber: 1, title: "Chest Day", muscleGroups: ["CHEST"] },
      ],
      completions: [],
      restDays: [],
      weeksToShow: 1,
    });
    const allEvents = weeks.flatMap((w) => w.days.flatMap((d) => d.events));
    const workoutEvent = allEvents.find((e) => e.type === "workout");
    if (!workoutEvent) return;
    const newDate = "2024-01-05";
    const updated = rescheduleEvent(weeks, workoutEvent.id, newDate);
    const movedEvent = updated.flatMap((w) => w.days.flatMap((d) => d.events)).find((e) => e.id === workoutEvent.id);
    expect(movedEvent?.date).toBe(newDate);
  });
});

describe("skipWorkout", () => {
  it("marks a workout as skipped", () => {
    const weeks = generateCalendar({
      startDate: new Date("2024-01-01"),
      programDays: [
        { dayNumber: 1, title: "Chest Day", muscleGroups: ["CHEST"] },
      ],
      completions: [],
      restDays: [0, 6],
      weeksToShow: 1,
    });
    const eventId = weeks[0]!.days.flatMap((d) => d.events).find((e) => e.type === "workout")!.id;
    const updated = skipWorkout(weeks, eventId);
    const skipped = updated.flatMap((w) => w.days.flatMap((d) => d.events)).find((e) => e.id === eventId);
    expect(skipped?.completed).toBe(true);
    expect(skipped?.notes).toBe("Skipped");
  });
});
