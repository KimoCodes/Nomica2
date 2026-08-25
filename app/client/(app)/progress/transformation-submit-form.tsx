"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type TransformationSubmitFormProps = {
  clientProfileId: string;
};

export function TransformationSubmitForm({
  clientProfileId,
}: TransformationSubmitFormProps) {
  const router = useRouter();
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [story, setStory] = useState("");
  const [beforeWeight, setBeforeWeight] = useState("");
  const [afterWeight, setAfterWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [programName, setProgramName] = useState("");

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>("");
  const [afterPreview, setAfterPreview] = useState<string>("");

  function handleBeforeSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024 * 1024) {
        setError("File must be under 50MB");
        return;
      }
      setBeforeFile(file);
      setBeforePreview(URL.createObjectURL(file));
      setError(null);
    }
  }

  function handleAfterSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024 * 1024) {
        setError("File must be under 50MB");
        return;
      }
      setAfterFile(file);
      setAfterPreview(URL.createObjectURL(file));
      setError(null);
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !quote.trim() || !story.trim()) {
      setError("Name, quote, and story are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("quote", quote);
    formData.append("story", story);
    if (beforeWeight) formData.append("beforeWeight", beforeWeight);
    if (afterWeight) formData.append("afterWeight", afterWeight);
    if (duration) formData.append("duration", duration);
    if (programName) formData.append("programName", programName);
    if (beforeFile) formData.append("beforePhoto", beforeFile);
    if (afterFile) formData.append("afterPhoto", afterFile);

    try {
      const response = await fetch(
        `/api/client/${clientProfileId}/transformation`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit transformation");
      }

      setSuccess(true);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setQuote("");
    setStory("");
    setBeforeWeight("");
    setAfterWeight("");
    setDuration("");
    setProgramName("");
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview("");
    setAfterPreview("");
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-success/50 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          Transformation submitted! Your coach will review it soon.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Before Photo</Label>
          <div
            onClick={() => beforeInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            {beforePreview ? (
              <div className="relative">
                <img
                  src={beforePreview}
                  alt="Before"
                  className="h-40 rounded-lg object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBeforeFile(null);
                    setBeforePreview("");
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <>
                <Camera className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Click to upload before photo
                </p>
              </>
            )}
          </div>
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBeforeSelect}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">After Photo</Label>
          <div
            onClick={() => afterInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            {afterPreview ? (
              <div className="relative">
                <img
                  src={afterPreview}
                  alt="After"
                  className="h-40 rounded-lg object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAfterFile(null);
                    setAfterPreview("");
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <>
                <Camera className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Click to upload after photo
                </p>
              </>
            )}
          </div>
          <input
            ref={afterInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAfterSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tf-name">Display Name</Label>
        <Input
          id="tf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How you'd like to be known (e.g., Sarah M.)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tf-quote">Short Quote</Label>
        <Input
          id="tf-quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="A short testimonial (shown on cards)"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          {quote.length}/200 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tf-story">Your Story</Label>
        <Textarea
          id="tf-story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tell us about your transformation journey..."
          rows={5}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="tf-before-weight" className="text-xs text-muted-foreground">
            Before Weight (kg)
          </Label>
          <Input
            id="tf-before-weight"
            type="number"
            step="0.1"
            value={beforeWeight}
            onChange={(e) => setBeforeWeight(e.target.value)}
            placeholder="72"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tf-after-weight" className="text-xs text-muted-foreground">
            After Weight (kg)
          </Label>
          <Input
            id="tf-after-weight"
            type="number"
            step="0.1"
            value={afterWeight}
            onChange={(e) => setAfterWeight(e.target.value)}
            placeholder="62"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tf-duration" className="text-xs text-muted-foreground">
            Duration
          </Label>
          <Input
            id="tf-duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="12 weeks"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tf-program" className="text-xs text-muted-foreground">
            Program Name
          </Label>
          <Input
            id="tf-program"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Glute Builder"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !name.trim() || !quote.trim() || !story.trim()}
        className="w-full group"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="mr-2 size-4" />
            Submit for Review
          </>
        )}
      </Button>
    </div>
  );
}
