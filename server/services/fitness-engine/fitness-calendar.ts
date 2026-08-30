export type CalendarEvent = {
  id: string;
  date: string;
  type: "workout" | "rest" | "checkin" | "habit" | "custom";
  title: string;
  completed: boolean;
  duration: number | null;
  muscleGroups: string[];
  notes: string | null;
};

export type CalendarDay = {
  date: string;
  dayName: string;
  dayNumber: number;
  events: CalendarEvent[];
  isToday: boolean;
  isPast: boolean;
};

export type CalendarWeek = {
  weekStart: string;
  weekEnd: string;
  days: CalendarDay[];
  summary: {
    plannedWorkouts: number;
    completedWorkouts: number;
    restDays: number;
  };
};

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function generateCalendar(params: {
  startDate: Date;
  programDays: { dayNumber: number; title: string | null; muscleGroups: string[] }[];
  completions: { completedAt: Date; dayNumber: number }[];
  restDays: number[];
  weeksToShow: number;
}): CalendarWeek[] {
  const { startDate, programDays, completions, restDays, weeksToShow } = params;
  const weeks: CalendarWeek[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completionMap = new Map<number, Date>();
  for (const c of completions) {
    completionMap.set(c.dayNumber, c.completedAt);
  }

  for (let w = 0; w < weeksToShow; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + w * 7);

    const days: CalendarDay[] = [];
    let plannedWorkouts = 0;
    let completedWorkouts = 0;
    let restDaysCount = 0;

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const dateStr = formatDate(date);
      const dayOfWeek = date.getDay();
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;

      const events: CalendarEvent[] = [];

      if (restDays.includes(dayOfWeek)) {
        restDaysCount++;
        events.push({
          id: `rest-${dateStr}`,
          date: dateStr,
          type: "rest",
          title: "Rest Day",
          completed: true,
          duration: null,
          muscleGroups: [],
          notes: null,
        });
      } else {
        const programDay = programDays.find((pd) => pd.dayNumber === (d + 1) % 7);
        if (programDay) {
          plannedWorkouts++;
          const completion = completionMap.get(programDay.dayNumber);
          const completed = completion !== undefined;
          if (completed) completedWorkouts++;

          events.push({
            id: `workout-${dateStr}-${programDay.dayNumber}`,
            date: dateStr,
            type: "workout",
            title: programDay.title ?? `Day ${programDay.dayNumber}`,
            completed,
            duration: null,
            muscleGroups: programDay.muscleGroups,
            notes: null,
          });
        }
      }

      days.push({
        date: dateStr,
        dayName: getDayName(date),
        dayNumber: date.getDate(),
        events,
        isToday,
        isPast,
      });
    }

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      days,
      summary: { plannedWorkouts, completedWorkouts, restDays: restDaysCount },
    });
  }

  return weeks;
}

export function rescheduleEvent(
  weeks: CalendarWeek[],
  eventId: string,
  newDate: string,
): CalendarWeek[] {
  let movedEvent: CalendarEvent | null = null;

  for (const week of weeks) {
    for (const day of week.days) {
      const idx = day.events.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        movedEvent = day.events.splice(idx, 1)[0]!;
        break;
      }
    }
    if (movedEvent) break;
  }

  if (!movedEvent) return weeks;

  for (const week of weeks) {
    for (const day of week.days) {
      if (day.date === newDate) {
        movedEvent.date = newDate;
        day.events.push(movedEvent);
        return weeks;
      }
    }
  }

  return weeks;
}

export function skipWorkout(
  weeks: CalendarWeek[],
  eventId: string,
): CalendarWeek[] {
  for (const week of weeks) {
    for (const day of week.days) {
      const event = day.events.find((e) => e.id === eventId);
      if (event && event.type === "workout") {
        event.completed = true;
        event.notes = "Skipped";
        return weeks;
      }
    }
  }
  return weeks;
}
