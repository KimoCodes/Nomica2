"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckInResponseForm } from "@/components/forms/check-in-response-form";
import {
  Battery,
  Moon,
  Dumbbell,
  ChevronDown,
} from "lucide-react";

type PendingCheckIn = {
  id: string;
  weekStart: Date;
  workoutsCompleted: number | null;
  energyLevel: number | null;
  sleepQuality: number | null;
  currentWeight: number | null;
  clientProfile: {
    user: {
      name: string | null;
    };
  };
};

export function PendingCheckInCard({
  checkIn,
}: {
  checkIn: PendingCheckIn;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-warning/20">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {checkIn.clientProfile.user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-semibold">
                {checkIn.clientProfile.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Week of {new Date(checkIn.weekStart).toLocaleDateString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {checkIn.workoutsCompleted != null && (
                  <span className="flex items-center gap-1.5">
                    <Dumbbell className="size-3.5" />
                    {checkIn.workoutsCompleted} workouts
                  </span>
                )}
                {checkIn.energyLevel != null && (
                  <span className="flex items-center gap-1.5">
                    <Battery className="size-3.5" />
                    Energy: {checkIn.energyLevel}/10
                  </span>
                )}
                {checkIn.sleepQuality != null && (
                  <span className="flex items-center gap-1.5">
                    <Moon className="size-3.5" />
                    Sleep: {checkIn.sleepQuality}/10
                  </span>
                )}
                {checkIn.currentWeight != null && (
                  <span className="flex items-center gap-1.5">
                    <Dumbbell className="size-3.5" />
                    {checkIn.currentWeight} kg
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-warning/10 text-warning border-warning/20">
              Pending
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setIsOpen(!isOpen)}
            >
              Respond
              <ChevronDown
                className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-warning/20 bg-muted/30 px-5 py-4">
          <CheckInResponseForm checkInId={checkIn.id} />
        </div>
      )}
    </div>
  );
}
