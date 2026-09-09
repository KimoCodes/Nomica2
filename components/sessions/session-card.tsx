"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  MoreHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarX,
} from "lucide-react";
import {
  cancelSessionAction,
  confirmSessionAction,
  requestRescheduleAction,
} from "@/actions/session.actions";
import { toast } from "sonner";

type Session = {
  id: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  sessionType: string;
  notes: string | null;
  cancellationReason: string | null;
  meetingUrl: string | null;
  location: string | null;
  coachNotes: string | null;
  clientProfile: {
    user: { id: string; name: string; email: string; avatar?: string | null };
  };
  coachProfile: {
    user: { id: string; name: string; email: string; avatar?: string | null };
  };
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  PENDING: { label: "Pending", variant: "secondary", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  CONFIRMED: { label: "Confirmed", variant: "default", color: "text-green-600 bg-green-50 border-green-200" },
  RESCHEDULE_REQUESTED: { label: "Reschedule Requested", variant: "outline", color: "text-blue-600 bg-blue-50 border-blue-200" },
  RESCHEDULED: { label: "Rescheduled", variant: "outline", color: "text-blue-600 bg-blue-50 border-blue-200" },
  CANCELLED: { label: "Cancelled", variant: "destructive", color: "text-red-600 bg-red-50 border-red-200" },
  COMPLETED: { label: "Completed", variant: "default", color: "text-green-600 bg-green-50 border-green-200" },
  MISSED: { label: "Missed", variant: "destructive", color: "text-orange-600 bg-orange-50 border-orange-200" },
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  CONSULTATION: "Consultation",
  TRAINING: "Training",
  ASSESSMENT: "Assessment",
  FOLLOW_UP: "Follow-up",
  CUSTOM: "Custom",
};

export function SessionCard({
  session,
  role,
  onAction,
}: {
  session: Session;
  role: "client" | "coach";
  onAction?: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [loading, setLoading] = useState(false);

  const statusConfig = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.PENDING;
  const scheduledDate = new Date(session.scheduledAt);
  const isUpcoming = scheduledDate > new Date() && !["CANCELLED", "COMPLETED", "MISSED"].includes(session.status);
  const otherUser = role === "client" ? session.coachProfile.user : session.clientProfile.user;

  async function handleCancel() {
    setLoading(true);
    try {
      const result = await cancelSessionAction(session.id, cancelReason || undefined);
      if (result.success) {
        toast.success("Session cancelled");
        setShowCancel(false);
        setShowDetail(false);
        onAction?.();
      } else {
        toast.error(result.error?.message ?? "Failed to cancel");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const result = await confirmSessionAction(session.id);
      if (result.success) {
        toast.success("Session confirmed");
        setShowDetail(false);
        onAction?.();
      } else {
        toast.error(result.error?.message ?? "Failed to confirm");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReschedule() {
    setLoading(true);
    try {
      const result = await requestRescheduleAction(session.id, rescheduleReason || undefined);
      if (result.success) {
        toast.success("Reschedule request sent");
        setShowReschedule(false);
        setShowDetail(false);
        onAction?.();
      } else {
        toast.error(result.error?.message ?? "Failed to request reschedule");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card
        className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={statusConfig.variant} className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {SESSION_TYPE_LABELS[session.sessionType] ?? session.sessionType}
                </span>
              </div>
              <p className="font-medium truncate">
                {role === "client" ? session.coachProfile.user.name : session.clientProfile.user.name}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {scheduledDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
                <span>{session.durationMinutes} min</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isUpcoming && session.status === "PENDING" && role === "coach" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirm();
                  }}
                  disabled={loading}
                >
                  <CheckCircle2 className="size-4" />
                </Button>
              )}
              {isUpcoming && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail(true);
                  }}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              )}
            </div>
          </div>
          {session.notes && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{session.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {otherUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{otherUser.name}</p>
                <p className="text-sm text-muted-foreground">{otherUser.email}</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>{scheduledDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span>{scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} ({session.durationMinutes} min)</span>
              </div>
              {session.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>{session.location}</span>
                </div>
              )}
              {session.meetingUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Video className="size-4 text-muted-foreground" />
                  <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Join meeting
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={statusConfig.variant} className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {SESSION_TYPE_LABELS[session.sessionType] ?? session.sessionType}
              </span>
            </div>

            {session.notes && (
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="mt-1 text-sm">{session.notes}</p>
              </div>
            )}

            {session.coachNotes && (
              <div>
                <Label className="text-xs text-muted-foreground">Coach Notes</Label>
                <p className="mt-1 text-sm">{session.coachNotes}</p>
              </div>
            )}

            {session.cancellationReason && (
              <div className="rounded-lg bg-red-50 p-3">
                <Label className="text-xs text-red-600">Cancellation Reason</Label>
                <p className="mt-1 text-sm text-red-700">{session.cancellationReason}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            {isUpcoming && session.status === "PENDING" && role === "coach" && (
              <Button size="sm" onClick={handleConfirm} disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CheckCircle2 className="mr-2 size-4" />}
                Confirm
              </Button>
            )}
            {isUpcoming && session.status !== "CANCELLED" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowDetail(false);
                    setShowReschedule(true);
                  }}
                >
                  <CalendarX className="mr-2 size-4" />
                  Reschedule
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setShowDetail(false);
                    setShowCancel(true);
                  }}
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel this session? The other party will be notified.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason (optional)</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Why are you cancelling?"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>Keep Session</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <AlertCircle className="mr-2 size-4" />}
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {role === "coach"
                ? "Please contact your client to arrange a new time, then confirm the reschedule."
                : "Your coach will be notified and will help find a new time."}
            </p>
            <div className="space-y-2">
              <Label htmlFor="reschedule-reason">Reason (optional)</Label>
              <Textarea
                id="reschedule-reason"
                placeholder="Why do you need to reschedule?"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReschedule(false)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CalendarX className="mr-2 size-4" />}
              Request Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
