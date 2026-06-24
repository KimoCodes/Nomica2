"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Upload, Camera, X, Loader2, Ruler } from "lucide-react";

type ProgressUploadFormProps = {
  clientProfileId: string;
};

export function ProgressUploadForm({ clientProfileId }: ProgressUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [type, setType] = useState("PROGRESS_PHOTO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [gluteCm, setGluteCm] = useState("");
  const [thighCm, setThighCm] = useState("");
  const [notes, setNotes] = useState("");
  const [photoAngles, setPhotoAngles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const validFiles = files.filter((f) => f.size <= 50 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      setError("Some files were too large (max 50MB). They were skipped.");
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError(null);

    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, url]);
      } else {
        setPreviews((prev) => [...prev, ""]);
      }
    });
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoAngles((prev) => prev.filter((_, i) => i !== index));
  }

  function setAngle(index: number, angle: string) {
    setPhotoAngles((prev) => {
      const newAngles = [...prev];
      newAngles[index] = angle;
      return newAngles;
    });
  }

  async function handleSubmit() {
    if (selectedFiles.length === 0 && !weight && !waistCm && !hipCm) {
      setError("Please add files or measurements");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("notes", notes);

    if (weight) formData.append("weight", weight);
    if (waistCm) formData.append("waistCm", waistCm);
    if (hipCm) formData.append("hipCm", hipCm);
    if (gluteCm) formData.append("gluteCm", gluteCm);
    if (thighCm) formData.append("thighCm", thighCm);

    selectedFiles.forEach((file, i) => {
      formData.append(`file_${i}`, file);
    });

    if (photoAngles.length > 0) {
      formData.append("photoAngles", photoAngles.join(","));
    }

    try {
      const response = await fetch(`/api/client/${clientProfileId}/progress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create progress entry");
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
    } finally {
      setIsUploading(false);
    }
  }

  function resetForm() {
    setSelectedFiles([]);
    setPreviews([]);
    setType("PROGRESS_PHOTO");
    setTitle("");
    setDescription("");
    setWeight("");
    setWaistCm("");
    setHipCm("");
    setGluteCm("");
    setThighCm("");
    setNotes("");
    setPhotoAngles([]);
    setError(null);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Entry Type</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? "PROGRESS_PHOTO")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROGRESS_PHOTO">Progress Photos</SelectItem>
            <SelectItem value="FORM_CHECK">Form Check</SelectItem>
            <SelectItem value="WEEKLY_UPDATE">Weekly Update</SelectItem>
            <SelectItem value="MEASUREMENT">Measurement Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="progress-title">Title</Label>
        <Input
          id="progress-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Week 4 Progress"
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            const input = fileInputRef.current;
            if (input) {
              const dataTransfer = new DataTransfer();
              files.forEach((f) => dataTransfer.items.add(f));
              input.files = dataTransfer.files;
              input.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
      >
        <Camera className="mb-2 size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">
          Drag photos/videos or{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-primary hover:underline"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP, MP4 — Max 50MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {selectedFiles.map((file, i) => (
            <div key={i} className="relative">
              {previews[i] ? (
                <img
                  src={previews[i]}
                  alt={`Preview ${i + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-lg bg-muted">
                  <span className="text-xs text-muted-foreground">Video</span>
                </div>
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-1 text-destructive-foreground"
              >
                <X className="size-3" />
              </button>
              {type === "PROGRESS_PHOTO" && file.type.startsWith("image/") && (
                <select
                  value={photoAngles[i] ?? ""}
                  onChange={(e) => setAngle(i, e.target.value)}
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="">Select angle</option>
                  <option value="FRONT">Front</option>
                  <option value="SIDE">Side</option>
                  <option value="BACK">Back</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>
          <Ruler className="mr-1 inline size-3" />
          Measurements (optional)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="weight" className="text-xs text-muted-foreground">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="72.5"
            />
          </div>
          <div>
            <Label htmlFor="waistCm" className="text-xs text-muted-foreground">Waist (cm)</Label>
            <Input
              id="waistCm"
              type="number"
              step="0.1"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              placeholder="70"
            />
          </div>
          <div>
            <Label htmlFor="hipCm" className="text-xs text-muted-foreground">Hips (cm)</Label>
            <Input
              id="hipCm"
              type="number"
              step="0.1"
              value={hipCm}
              onChange={(e) => setHipCm(e.target.value)}
              placeholder="95"
            />
          </div>
          <div>
            <Label htmlFor="gluteCm" className="text-xs text-muted-foreground">Glutes (cm)</Label>
            <Input
              id="gluteCm"
              type="number"
              step="0.1"
              value={gluteCm}
              onChange={(e) => setGluteCm(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="progress-notes">Notes</Label>
        <Textarea
          id="progress-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling? Any changes you've noticed?"
          rows={3}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isUploading || (selectedFiles.length === 0 && !weight && !waistCm)}
        className="w-full group"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 size-4" />
            Save Progress Entry
          </>
        )}
      </Button>
    </div>
  );
}
