"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignProgramAction } from "@/actions/assignment.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type AssignProgramFormProps = {
  clientProfileId: string;
  clientName: string;
  programs: Array<{ id: string; title: string }>;
};

export function AssignProgramForm({
  clientProfileId,
  clientName,
  programs,
}: AssignProgramFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    formData.set("clientProfileId", clientProfileId);

    const result = await assignProgramAction(formData);

    if (!result.success) {
      setError(result.error?.message ?? "Failed to assign program");
      setIsPending(false);
      return;
    }

    toast.success("Program assigned", {
      description: "The program has been assigned to the client.",
    });
    router.refresh();
    setIsPending(false);
  }

  if (programs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a program first before assigning to {clientName}.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`program-${clientProfileId}`}>Program</Label>
        <input type="hidden" name="programId" />
        <Select onValueChange={(value: string | null) => {
          const hiddenInput = document.querySelector('input[name="programId"]') as HTMLInputElement;
          if (hiddenInput && value) hiddenInput.value = value;
        }}>
          <SelectTrigger id={`program-${clientProfileId}`}>
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Assigning..." : "Assign program"}
      </Button>
    </form>
  );
}
