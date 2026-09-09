"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createExerciseAction } from "@/actions/exercise.actions";
import {
  DIFFICULTY_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from "@/constants/exercises";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, Video, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateExerciseForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be under 100MB");
      return;
    }

    setVideoFile(file);
    setUploadedUrl(null);
    setError(null);

    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setUploadedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);

      const res = await fetch("/api/exercises/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedUrl(data.url);
      return data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload video");
      return null;
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    let videoUrl = formData.get("videoUrl") as string;

    if (videoFile && !uploadedUrl) {
      const url = await uploadVideo();
      if (url) {
        videoUrl = url;
      } else {
        setIsPending(false);
        return;
      }
    }

    if (uploadedUrl) {
      videoUrl = uploadedUrl;
    }

    formData.set("videoUrl", videoUrl || "");

    const result = await trackLoading(() => createExerciseAction(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to create exercise");
      setIsPending(false);
      return;
    }

    toast.success("Exercise created", {
      description: "Your new exercise has been added to the library.",
    });
    router.refresh();
    setIsPending(false);
    setVideoFile(null);
    setVideoPreview(null);
    setUploadedUrl(null);
    (document.getElementById("create-exercise-form") as HTMLFormElement)?.reset();
  }

  return (
    <form id="create-exercise-form" action={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Barbell bench press" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="muscleGroup">Muscle group</Label>
          <input type="hidden" name="muscleGroup" id="muscleGroup-hidden" />
          <Select onValueChange={(value: string | null) => {
            const hiddenInput = document.getElementById("muscleGroup-hidden") as HTMLInputElement;
            if (hiddenInput && value) hiddenInput.value = value;
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select muscle group" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <input type="hidden" name="difficulty" id="difficulty-hidden" />
          <Select onValueChange={(value: string | null) => {
            const hiddenInput = document.getElementById("difficulty-hidden") as HTMLInputElement;
            if (hiddenInput && value) hiddenInput.value = value;
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Demo Video / Image (optional)</Label>
          <input type="hidden" name="videoUrl" value={uploadedUrl || ""} />

          {videoPreview ? (
            <div className="relative rounded-lg border border-dashed border-muted-foreground/25 p-4">
              {videoFile?.type.startsWith("video/") ? (
                <video
                  src={videoPreview}
                  className="mx-auto max-h-48 rounded-md"
                  controls
                />
              ) : (
                <img
                  src={videoPreview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-md object-contain"
                />
              )}
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {videoFile?.type.startsWith("video/") ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  {videoFile?.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {uploading && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading...
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-muted-foreground/25 p-6 transition-colors hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload a video or image
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, MOV, WebM, JPG, PNG up to 100MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Input
            id="videoUrl"
            name="videoUrlInput"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            disabled={!!videoFile}
            onChange={(e) => {
              if (e.target.value) {
                setUploadedUrl(e.target.value);
              } else {
                setUploadedUrl(null);
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Paste a YouTube, Vimeo, or other video URL
          </p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            required
            rows={4}
            placeholder="Setup, execution, and coaching cues..."
          />
        </div>
      </div>
      <LoadingButton type="submit" loading={isPending} loadingText="Adding...">
        Add exercise
      </LoadingButton>
    </form>
  );
}
