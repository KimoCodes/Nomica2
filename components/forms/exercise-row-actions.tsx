"use client";

import type { Difficulty, MuscleGroup } from "@prisma/client";
import { PencilIcon, Trash2Icon, Upload, X, Video, Image } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  deleteExerciseAction,
  updateExerciseAction,
} from "@/actions/exercise.actions";
import {
  DIFFICULTY_OPTIONS,
  MUSCLE_GROUP_OPTIONS,
} from "@/constants/exercises";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ExerciseRowActionsProps = {
  exercise: {
    id: string;
    name: string;
    muscleGroup: MuscleGroup;
    difficulty: Difficulty;
    instructions: string;
    videoUrl: string | null;
  };
};

export function ExerciseRowActions({ exercise }: ExerciseRowActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  async function handleUpdate(formData: FormData) {
    setIsSaving(true);
    setError(null);

    let videoUrl = formData.get("videoUrl") as string;

    if (videoFile && !uploadedUrl) {
      const url = await uploadVideo();
      if (url) {
        videoUrl = url;
      } else {
        setIsSaving(false);
        return;
      }
    }

    if (uploadedUrl) {
      videoUrl = uploadedUrl;
    }

    formData.set("videoUrl", videoUrl || "");

    const result = await trackLoading(() => updateExerciseAction(exercise.id, formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to update exercise");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setOpen(false);
    setVideoFile(null);
    setVideoPreview(null);
    setUploadedUrl(null);
    router.refresh();
  }

  async function handleDelete() {
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await trackLoading(() => deleteExerciseAction(exercise.id));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to delete exercise");
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOpen(true);
      return;
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null);
            setVideoFile(null);
            setVideoPreview(null);
            setUploadedUrl(null);
            setOpen(true);
          }}
        >
          <PencilIcon />
          Edit
        </Button>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit exercise</DialogTitle>
            <DialogDescription>
              Update the custom movement coaches can add to programs.
            </DialogDescription>
          </DialogHeader>

          <form action={handleUpdate} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`name-${exercise.id}`}>Name</Label>
                <Input
                  id={`name-${exercise.id}`}
                  name="name"
                  required
                  defaultValue={exercise.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`muscleGroup-${exercise.id}`}>
                  Muscle group
                </Label>
                <input type="hidden" name="muscleGroup" id={`muscleGroup-hidden-${exercise.id}`} defaultValue={exercise.muscleGroup ?? ""} />
                <Select defaultValue={exercise.muscleGroup ?? ""} onValueChange={(value: string | null) => {
                  const hiddenInput = document.getElementById(`muscleGroup-hidden-${exercise.id}`) as HTMLInputElement;
                  if (hiddenInput && value) hiddenInput.value = value;
                }}>
                  <SelectTrigger id={`muscleGroup-${exercise.id}`}>
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
                <Label htmlFor={`difficulty-${exercise.id}`}>
                  Difficulty
                </Label>
                <input type="hidden" name="difficulty" id={`difficulty-hidden-${exercise.id}`} defaultValue={exercise.difficulty ?? ""} />
                <Select defaultValue={exercise.difficulty ?? ""} onValueChange={(value: string | null) => {
                  const hiddenInput = document.getElementById(`difficulty-hidden-${exercise.id}`) as HTMLInputElement;
                  if (hiddenInput && value) hiddenInput.value = value;
                }}>
                  <SelectTrigger id={`difficulty-${exercise.id}`}>
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
                <input type="hidden" name="videoUrl" value={uploadedUrl || exercise.videoUrl || ""} />

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
                ) : exercise.videoUrl ? (
                  <div className="relative rounded-lg border border-dashed border-muted-foreground/25 p-4">
                    {exercise.videoUrl.match(/\.(mp4|mov|webm)/i) ? (
                      <video
                        src={exercise.videoUrl}
                        className="mx-auto max-h-48 rounded-md"
                        controls
                      />
                    ) : (
                      <img
                        src={exercise.videoUrl}
                        alt="Current"
                        className="mx-auto max-h-48 rounded-md object-contain"
                      />
                    )}
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Current media</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedUrl("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
                  id={`videoUrl-${exercise.id}`}
                  name="videoUrlInput"
                  type="url"
                  defaultValue={exercise.videoUrl ?? ""}
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
                <Label htmlFor={`instructions-${exercise.id}`}>
                  Instructions
                </Label>
                <Textarea
                  id={`instructions-${exercise.id}`}
                  name="instructions"
                  required
                  rows={5}
                  defaultValue={exercise.instructions}
                />
              </div>
            </div>

            <DialogFooter>
              <LoadingButton type="submit" loading={isSaving} loadingText="Saving...">
                Save changes
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingButton
        type="button"
        variant="destructive"
        size="sm"
        loading={isDeleting}
        loadingText="Deleting..."
        onClick={handleDelete}
      >
        <Trash2Icon />
        Delete
      </LoadingButton>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{exercise.name}&quot; from your exercise library? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
