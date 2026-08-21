"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { trackLoading } from "@/components/ui/loading-bar";
import { updateProfileAction, changePasswordAction } from "@/actions/settings.actions";
import { User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

type ProfileFormProps = {
  name: string;
  email: string;
};

export function ProfileForm({ name, email }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setSuccess(null);

    const result = await trackLoading(() => updateProfileAction(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to update profile");
      setIsPending(false);
      return;
    }

    setSuccess("Profile updated successfully");
    setIsPending(false);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div aria-live="polite" className="rounded-xl border border-success/50 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            defaultValue={name}
            className="h-11 pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground text-xs">@</span>
          <Input
            id="email"
            type="email"
            defaultValue={email}
            className="h-11 pl-10"
            disabled
          />
        </div>
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <LoadingButton type="submit" loading={isPending} loadingText="Saving..." className="group">
        Save changes
        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
      </LoadingButton>
    </form>
  );
}

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    setSuccess(null);

    const result = await trackLoading(() => changePasswordAction(formData));

    if (!result.success) {
      setError(result.error?.message ?? "Failed to change password");
      setIsPending(false);
      return;
    }

    setSuccess("Password changed successfully");
    setIsPending(false);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div aria-live="polite" className="rounded-xl border border-success/50 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm font-medium">Current password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            className="h-11 pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm font-medium">New password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            className="h-11 pl-10"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
      </div>

      <LoadingButton type="submit" loading={isPending} loadingText="Changing..." className="group">
        Change password
        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
      </LoadingButton>
    </form>
  );
}
