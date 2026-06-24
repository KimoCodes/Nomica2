"use client";

import { useState } from "react";
import { MediaType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Film, Image, Play, Eye } from "lucide-react";

type MediaItem = {
  id: string;
  title: string;
  description: string | null;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string;
  duration: number | null;
  tags: { tag: string }[];
  createdAt: Date;
  _count: { progressLogs: number };
};

type MediaGridProps = {
  media: MediaItem[];
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  WORKOUT_VIDEO: Film,
  EXERCISE_DEMO: Film,
  TRAINING_IMAGE: Image,
  TRANSFORMATION: Image,
  PROGRESS_PHOTO: Image,
  PROGRESS_VIDEO: Film,
};

const typeColors: Record<string, string> = {
  WORKOUT_VIDEO: "bg-primary/10 text-primary",
  EXERCISE_DEMO: "bg-chart-3/10 text-chart-3",
  TRAINING_IMAGE: "bg-success/10 text-success",
  TRANSFORMATION: "bg-chart-5/10 text-chart-5",
  PROGRESS_PHOTO: "bg-chart-4/10 text-chart-4",
  PROGRESS_VIDEO: "bg-warning/10 text-warning",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function MediaGrid({ media }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Film className="mb-3 size-12 text-muted-foreground/30" />
        <p className="text-sm font-medium">No media found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload your first video or image to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((item, index) => {
          const Icon = typeIcons[item.type] ?? Film;
          const colorClass = typeColors[item.type] ?? "bg-muted text-muted-foreground";
          const isVideo = item.mimeType.startsWith("video/");

          return (
            <button
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className={`animate-slide-up stagger-${Math.min(index + 1, 8)} group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium`}
            >
              <div className="relative aspect-video bg-muted">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Icon className={`size-10 ${colorClass} rounded-xl p-2`} />
                  </div>
                )}

                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/90">
                      <Play className="size-5 text-foreground" />
                    </div>
                  </div>
                )}

                {item.duration && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    {formatDuration(item.duration)}
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </span>
                </div>
                {item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((t) => (
                      <span
                        key={t.tag}
                        className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        #{t.tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog
        open={!!selectedMedia}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.title}</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {selectedMedia.mimeType.startsWith("video/") ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="size-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="size-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selectedMedia.type.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline">
                  {formatFileSize(selectedMedia.fileSize)}
                </Badge>
                {selectedMedia.duration && (
                  <Badge variant="outline">
                    {formatDuration(selectedMedia.duration)}
                  </Badge>
                )}
              </div>

              {selectedMedia.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedMedia.description}
                </p>
              )}

              {selectedMedia.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedMedia.tags.map((t) => (
                    <Badge key={t.tag} variant="secondary" className="text-xs">
                      #{t.tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="size-3" />
                Used in {selectedMedia._count.progressLogs} progress entries
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
