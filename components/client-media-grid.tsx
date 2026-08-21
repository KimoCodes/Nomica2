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
import { Film, Image, Play } from "lucide-react";

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
  uploadedBy: { id: string; name: string | null } | null;
};

type ClientMediaGridProps = {
  media: MediaItem[];
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ClientMediaGrid({ media }: ClientMediaGridProps) {
  const [selected, setSelected] = useState<MediaItem | null>(null);

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Film className="mb-3 size-12 text-muted-foreground/30" />
        <p className="text-sm font-medium">No media yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your coach will share workout videos and training images here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => {
          const isVideo = item.mimeType.startsWith("video/");
          const Icon = isVideo ? Film : Image;

          return (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium"
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
                    <Icon className="size-10 text-muted-foreground/30" />
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
                  {item.uploadedBy?.name && (
                    <span className="text-xs text-muted-foreground">
                      by {item.uploadedBy.name}
                    </span>
                  )}
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
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {selected.mimeType.startsWith("video/") ? (
                  <video
                    src={selected.url}
                    controls
                    className="size-full object-contain"
                  />
                ) : (
                  <img
                    src={selected.url}
                    alt={selected.title}
                    className="size-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selected.type.replace(/_/g, " ")}
                </Badge>
                {selected.duration && (
                  <Badge variant="outline">
                    {formatDuration(selected.duration)}
                  </Badge>
                )}
              </div>

              {selected.description && (
                <p className="text-sm text-muted-foreground">
                  {selected.description}
                </p>
              )}

              {selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map((t) => (
                    <Badge key={t.tag} variant="secondary" className="text-xs">
                      #{t.tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
