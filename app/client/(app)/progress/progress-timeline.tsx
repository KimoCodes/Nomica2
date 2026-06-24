"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Video,
  Ruler,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";

type ProgressPhoto = {
  id: string;
  view: string;
  media: {
    url: string;
    thumbnailUrl: string | null;
  };
};

type ProgressLog = {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  weight: number | null;
  waistCm: number | null;
  hipCm: number | null;
  gluteCm: number | null;
  thighCm: number | null;
  notes: string | null;
  coachComment: string | null;
  coachRating: number | null;
  commentedAt: Date | null;
  loggedAt: Date;
  media: { url: string; type: string } | null;
  photos: ProgressPhoto[];
  coach: { id: string; name: string } | null;
};

type ProgressTimelineProps = {
  logs: ProgressLog[];
};

const typeLabels: Record<string, string> = {
  PROGRESS_PHOTO: "Progress Photos",
  FORM_CHECK: "Form Check",
  WEEKLY_UPDATE: "Weekly Update",
  MEASUREMENT: "Measurement",
  MILESTONE: "Milestone",
  COACH_FEEDBACK: "Coach Feedback",
};

const typeColors: Record<string, string> = {
  PROGRESS_PHOTO: "bg-primary/10 text-primary",
  FORM_CHECK: "bg-chart-3/10 text-chart-3",
  WEEKLY_UPDATE: "bg-success/10 text-success",
  MEASUREMENT: "bg-warning/10 text-warning",
  MILESTONE: "bg-chart-5/10 text-chart-5",
  COACH_FEEDBACK: "bg-chart-4/10 text-chart-4",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProgressTimeline({ logs }: ProgressTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Camera className="mb-3 size-12 text-muted-foreground/30" />
        <p className="text-sm font-medium">No progress entries yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload your first progress photos or measurements to start your transformation timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      {logs.map((log, index) => {
        const colorClass = typeColors[log.type] ?? "bg-muted text-muted-foreground";

        return (
          <div
            key={log.id}
            className={`animate-slide-up stagger-${Math.min(index + 1, 8)} relative pl-14`}
          >
            <div
              className={`absolute left-4 top-6 flex size-5 items-center justify-center rounded-full ${colorClass}`}
            >
              {log.type.includes("PHOTO") ? (
                <Camera className="size-3" />
              ) : log.type.includes("VIDEO") || log.type === "FORM_CHECK" ? (
                <Video className="size-3" />
              ) : log.type === "MEASUREMENT" ? (
                <Ruler className="size-3" />
              ) : (
                <TrendingUp className="size-3" />
              )}
            </div>

            <Card className="transition-all duration-200 hover:shadow-premium">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {typeLabels[log.type] ?? log.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.loggedAt)}
                      </span>
                    </div>
                    {log.title && (
                      <p className="mt-2 font-medium">{log.title}</p>
                    )}
                  </div>
                </div>

                {(log.weight || log.waistCm || log.hipCm || log.gluteCm || log.thighCm) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {log.weight && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                        <TrendingUp className="size-3.5 text-primary" />
                        <span className="font-medium">{log.weight}</span>
                        <span className="text-muted-foreground">kg</span>
                      </div>
                    )}
                    {log.waistCm && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                        <Ruler className="size-3.5 text-chart-3" />
                        <span className="font-medium">{log.waistCm}</span>
                        <span className="text-muted-foreground">cm waist</span>
                      </div>
                    )}
                    {log.hipCm && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                        <Ruler className="size-3.5 text-chart-5" />
                        <span className="font-medium">{log.hipCm}</span>
                        <span className="text-muted-foreground">cm hips</span>
                      </div>
                    )}
                    {log.gluteCm && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                        <Ruler className="size-3.5 text-success" />
                        <span className="font-medium">{log.gluteCm}</span>
                        <span className="text-muted-foreground">cm glutes</span>
                      </div>
                    )}
                    {log.thighCm && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                        <Ruler className="size-3.5 text-warning" />
                        <span className="font-medium">{log.thighCm}</span>
                        <span className="text-muted-foreground">cm thigh</span>
                      </div>
                    )}
                  </div>
                )}

                {log.description && (
                  <p className="mt-3 text-sm text-muted-foreground">{log.description}</p>
                )}

                {log.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{log.notes}</p>
                )}

                {log.photos.length > 0 && (
                  <div className="mt-4 flex gap-3">
                    {log.photos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.media.url}
                          alt={`${photo.view} view`}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white capitalize">
                          {photo.view.toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {log.media && log.media.type.includes("video") && (
                  <div className="mt-4">
                    <video
                      src={log.media.url}
                      controls
                      className="w-full max-w-sm rounded-lg"
                    />
                  </div>
                )}

                {log.coachComment && (
                  <div className="mt-4 rounded-xl bg-primary/5 p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-primary" />
                      <span className="text-sm font-medium">
                        {log.coach?.name ?? "Coach"}
                      </span>
                      {log.coachRating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < log.coachRating!
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {log.coachComment}
                    </p>
                    {log.commentedAt && (
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {formatDate(log.commentedAt)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
