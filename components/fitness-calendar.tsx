"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, X, Calendar } from "lucide-react";

type CalendarEvent = {
  id: string;
  date: string;
  type: "workout" | "rest" | "scheduled";
  title: string;
  completed: boolean;
  skipped: boolean;
  notes: string;
};

type CalendarWeek = {
  weekStart: string;
  days: {
    date: string;
    dayOfWeek: string;
    events: CalendarEvent[];
    isToday: boolean;
  }[];
};

type FitnessCalendarProps = {
  weeks: CalendarWeek[];
  onReschedule?: (eventId: string, newDate: string) => void;
  onSkip?: (eventId: string) => void;
};

export function FitnessCalendar({ weeks, onSkip }: FitnessCalendarProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const currentWeek = weeks[currentWeekIndex];

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekIndex((prev) => {
      if (direction === "prev") return Math.max(0, prev - 1);
      return Math.min(weeks.length - 1, prev + 1);
    });
  };

  const handleSkip = (eventId: string) => {
    onSkip?.(eventId);
    setSelectedEvent(null);
  };

  const typeColors: Record<string, string> = {
    workout: "bg-blue-100 border-blue-300",
    rest: "bg-green-50 border-green-200",
    scheduled: "bg-gray-50 border-gray-200",
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 border-green-400",
    skipped: "bg-red-50 border-red-200",
    default: "",
  };

  if (!currentWeek) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fitness Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No calendar data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fitness Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
              disabled={currentWeekIndex === 0}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Week {currentWeekIndex + 1} of {weeks.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
              disabled={currentWeekIndex === weeks.length - 1}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {currentWeek.days.map((day) => (
            <div key={day.date} className="space-y-1">
              <div className={`text-center text-xs font-medium ${day.isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                {day.dayOfWeek}
              </div>
              <div className={`text-center text-xs ${day.isToday ? "font-bold" : ""}`}>
                {new Date(day.date).getDate()}
              </div>
              {day.events.map((event) => {
                const colorClass = event.completed
                  ? statusColors.completed
                  : event.skipped
                    ? statusColors.skipped
                    : typeColors[event.type] ?? typeColors.scheduled;

                return (
                  <div
                    key={event.id}
                    className={`relative rounded border p-1 text-xs cursor-pointer ${colorClass} ${
                      selectedEvent === event.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedEvent(selectedEvent === event.id ? null : event.id);
                      }
                    }}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    {event.completed && <Check className="absolute top-0.5 right-0.5 h-3 w-3 text-green-600" />}
                    {event.skipped && <X className="absolute top-0.5 right-0.5 h-3 w-3 text-red-600" />}

                    {selectedEvent === event.id && event.type === "workout" && !event.completed && !event.skipped && (
                      <div className="absolute top-full left-0 z-10 mt-1 w-32 rounded border bg-white p-1 shadow-lg">
                        <button
                          className="w-full rounded px-2 py-1 text-left text-xs hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkip(event.id);
                          }}
                        >
                          Skip Workout
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border bg-blue-100 border-blue-300" />
            <span>Workout</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border bg-green-50 border-green-200" />
            <span>Rest Day</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border bg-green-100 border-green-400" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border bg-red-50 border-red-200" />
            <span>Skipped</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
