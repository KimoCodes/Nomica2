"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Loader2 } from "lucide-react";

type Coach = {
  id: string;
  name: string;
  specialties: string[];
  bio: string | null;
  yearsExperience: number | null;
};

type BookingModalProps = {
  coach: Coach;
  open: boolean;
  onClose: () => void;
  onBook: (data: { scheduledAt: string; durationMinutes: number; notes: string }) => Promise<void>;
};

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function BookingModal({ coach, open, onClose, onBook }: BookingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await onBook({ scheduledAt, durationMinutes: duration, notes });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {coach.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">{coach.name}</p>
            {coach.yearsExperience && (
              <p className="text-xs text-muted-foreground">
                {coach.yearsExperience} years experience
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-1">
              {coach.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="mr-1 inline h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="mr-1 inline h-4 w-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={duration === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="What you'd like to work on..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !date || !time}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
