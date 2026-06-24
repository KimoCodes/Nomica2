"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgramAction } from "@/actions/program.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, FileText } from "lucide-react";

export function CreateProgramForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    formData.set("isTemplate", "true");

    const result = await createProgramAction(formData);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to create program");
      setIsPending(false);
      return;
    }

    router.push(`/coach/programs/${result.data?.id}`);
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Program title
        </Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="title"
            name="title"
            required
            placeholder="8-Week Strength Builder"
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Who is this program for? What goals does it target?"
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">Optional</p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full group">
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            Create program
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
