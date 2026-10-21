"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/actions/settings.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, Video } from "lucide-react";

export function SiteSettingsClient({
  initialVideoGuidedWorkouts,
}: {
  initialVideoGuidedWorkouts: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [videosOn, setVideosOn] = useState(initialVideoGuidedWorkouts);

  function save(next: boolean) {
    setVideosOn(next);
    startTransition(async () => {
      const result = await updateSiteSettingsAction({ videoGuidedWorkouts: next });
      if (result.success) {
        toast.success(
          next
            ? "Video-guided workouts enabled — videos are optional for clients"
            : "Video-guided workouts hidden from clients",
        );
        router.refresh();
      } else {
        setVideosOn(!next);
        toast.error(result.error?.message || "Failed to update setting");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Video className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Video-Guided Workouts</CardTitle>
                <CardDescription className="mt-1">
                  Show optional exercise video demos in the workout player,
                  workouts list, and exercise library.
                </CardDescription>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={videosOn}
              aria-label="Video-guided workouts"
              disabled={isPending}
              onClick={() => save(!videosOn)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
                videosOn ? "bg-primary" : "bg-muted border border-border",
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
                  videosOn ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "flex items-start gap-2 rounded-xl border p-3 text-sm",
              videosOn
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-border/50 bg-muted/40 text-muted-foreground",
            )}
          >
            {videosOn ? (
              <>
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p>
                  <span className="font-medium">On (optional).</span> Clients see
                  a &ldquo;Watch demo&rdquo; link when a video exists. Videos are
                  never required — workouts can always be completed without
                  watching one.
                </p>
              </>
            ) : (
              <>
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>
                  <span className="font-medium">Off.</span> All video links and
                  previews are hidden from clients. Programs, tracking, and
                  workout completion are unaffected.
                </p>
              </>
            )}
          </div>
          <LoadingButton
            loading={isPending}
            loadingText="Saving..."
            onClick={() => save(!videosOn)}
            className="mt-4"
            variant={videosOn ? "outline" : "default"}
          >
            {videosOn ? "Turn off video demos" : "Turn on video demos"}
          </LoadingButton>
        </CardContent>
      </Card>
    </div>
  );
}
