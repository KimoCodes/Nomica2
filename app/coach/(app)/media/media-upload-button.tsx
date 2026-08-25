"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Upload, Film, ImageIcon, Loader2, X, Tag } from "lucide-react";

export function MediaUploadButton() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("COACH_ONLY");
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024 * 1024) {
      setError("File too large. Maximum size is 1.5GB.");
      return;
    }

    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setError(null);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title || "Untitled");
    formData.append("description", description);
    formData.append("purpose", purpose);
    formData.append("tags", tags);
    formData.append("visibility", visibility);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function resetForm() {
    setSelectedFile(null);
    setPreview(null);
    setTitle("");
    setDescription("");
    setPurpose("");
    setTags("");
    setVisibility("COACH_ONLY");
    setError(null);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button className="group">
            <Upload className="mr-2 size-4" />
            Upload Media
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : selectedFile ? (
              <div className="flex items-center gap-3">
                {selectedFile.type.startsWith("video/") ? (
                  <Film className="size-8 text-primary" />
                ) : (
                  <ImageIcon className="size-8 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  Drag & drop or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  MP4, MOV, JPEG, PNG, WebP — Max 100MB
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-title">Title</Label>
            <Input
              id="media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Hip Thrust Demo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-description">Description</Label>
            <Textarea
              id="media-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select value={purpose} onValueChange={(v) => setPurpose(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workout">Workout Video</SelectItem>
                  <SelectItem value="exercise">Exercise Demo</SelectItem>
                  <SelectItem value="training">Training Image</SelectItem>
                  <SelectItem value="hero">Hero Reel</SelectItem>
                  <SelectItem value="product">Product Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v ?? "COACH_ONLY")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COACH_ONLY">Coach Only</SelectItem>
                  <SelectItem value="CLIENT_ONLY">Client Only</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="TEAM_ONLY">Team Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="media-tags">
              <Tag className="mr-1 inline size-3" />
              Tags (comma separated)
            </Label>
            <Input
              id="media-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., glutes, beginner, form"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
