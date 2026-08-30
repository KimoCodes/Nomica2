"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Video, CheckCircle, Clock, Star, Loader2 } from "lucide-react";

type VideoItem = {
  id: string;
  videoUrl: string;
  exerciseName: string;
  status: "pending" | "reviewed" | "approved";
  coachNotes: string | null;
  formScore: number | null;
  createdAt: string;
};

type VideoFeedbackProps = {
  videos: VideoItem[];
  onSubmit: (exerciseName: string, file: File) => Promise<void>;
};

export function VideoFeedbackUpload({ videos, onSubmit }: VideoFeedbackProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !exerciseName.trim()) return;

    setUploading(true);
    try {
      await onSubmit(exerciseName.trim(), file);
      setExerciseName("");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
  };

  const statusIcons = {
    pending: Clock,
    reviewed: CheckCircle,
    approved: Star,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Submit Video for Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Exercise Name</label>
              <Input
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Barbell Squat"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Video File</label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            <Button type="submit" disabled={uploading || !file || !exerciseName.trim()}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No videos submitted yet
            </p>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => {
                const StatusIcon = statusIcons[video.status];
                return (
                  <div
                    key={video.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{video.exerciseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {video.formScore && (
                        <span className="text-sm font-medium">
                          {video.formScore}/10
                        </span>
                      )}
                      <Badge className={statusColors[video.status]}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {videos.some((v) => v.coachNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Coach Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos
              .filter((v) => v.coachNotes)
              .map((video) => (
                <div key={video.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{video.exerciseName}</p>
                    {video.formScore && (
                      <Badge variant="secondary">{video.formScore}/10</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{video.coachNotes}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
