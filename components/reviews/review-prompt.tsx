"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getMyProductReviewAction,
  submitProductReviewAction,
} from "@/actions/review.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type ReviewPromptProps = {
  productId: string;
  productName: string;
  completedDays: number;
  totalDays: number;
};

export function ReviewPrompt({
  productId,
  productName,
  completedDays,
  totalDays,
}: ReviewPromptProps) {
  const [existing, setExisting] = useState<{ rating: number; title: string | null } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getMyProductReviewAction(productId).then((result) => {
      if (cancelled) return;
      if (result.success && result.data?.review) {
        setExisting(result.data.review);
        setRating(result.data.review.rating);
        setTitle(result.data.review.title ?? "");
        setBody(result.data.review.body);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!loaded) return null;

  if (existing) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex items-start gap-3 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="font-medium">Thanks for your review of {productName}</p>
            <div className="mt-1 flex gap-0.5" aria-label={`${existing.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "size-4",
                    n <= existing.rating ? "fill-current text-yellow-500" : "text-muted-foreground/30",
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completedDays < totalDays) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <MessageSquare className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {completedDays} of {totalDays} workouts complete
            </p>
            <p className="text-xs text-muted-foreground">
              Finish the program to share your experience.
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.round((completedDays / Math.max(1, totalDays)) * 100))}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await submitProductReviewAction({
        productId,
        rating,
        title: title.trim() || undefined,
        body,
      });
      if (!result.success) {
        toast.error(result.error?.message ?? "Could not save your review");
        return;
      }
      setExisting({ rating, title: title.trim() || null });
      setOpen(false);
      toast.success("Review published — thank you!");
    });
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-medium">You finished {productName} 🎉</p>
          <p className="text-sm text-muted-foreground">
            Help other women choose with confidence — leave a quick review.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>Leave a review</Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review {productName}</DialogTitle>
              <DialogDescription>
                Only owners can review. Your review appears on the program page.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Rating</Label>
                <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => setRating(n)}
                      className="rounded p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "size-7",
                          n <= rating ? "fill-current text-yellow-500" : "text-muted-foreground/30",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="review-title">Title (optional)</Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Loved the progression"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="review-body">Your experience</Label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  placeholder="What worked for you? How did the program feel week to week?"
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {body.trim().length}/2000 characters (min 10)
                </p>
              </div>
              <Button
                onClick={submit}
                disabled={isPending || body.trim().length < 10}
                className="w-full"
              >
                {isPending ? "Publishing…" : "Publish review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
