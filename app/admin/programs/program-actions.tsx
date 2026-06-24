"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProgramSellableAction,
  deleteProgramAction,
} from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Trash2,
  Tag,
  DollarSign,
  ImageIcon,
  Star,
  X,
} from "lucide-react";

type Program = {
  id: string;
  title: string;
  description: string | null;
  isSellable: boolean;
  price: number | null;
  imageUrl: string | null;
  features: string[];
  difficulty: string | null;
  duration: number | null;
};

type ProgramActionsProps = {
  program: Program;
};

export function ProgramActions({ program }: ProgramActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSellable, setIsSellable] = useState(program.isSellable);
  const [price, setPrice] = useState(program.price?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(program.imageUrl ?? "");
  const [features, setFeatures] = useState<string[]>(program.features);
  const [newFeature, setNewFeature] = useState("");
  const [difficulty, setDifficulty] = useState(program.difficulty ?? "");
  const [duration, setDuration] = useState(program.duration?.toString() ?? "");

  async function handleSave() {
    setIsPending(true);
    const result = await updateProgramSellableAction(program.id, {
      isSellable,
      price: price ? parseInt(price) : null,
      imageUrl: imageUrl || null,
      features,
      difficulty: difficulty || null,
      duration: duration ? parseInt(duration) : null,
    });
    if (result.success) {
      setShowEditDialog(false);
      router.refresh();
    }
    setIsPending(false);
  }

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteProgramAction(program.id);
    if (result.success) {
      setShowDeleteDialog(false);
      router.refresh();
    }
    setIsPending(false);
  }

  function addFeature() {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditDialog(true)}
          className="gap-1"
        >
          <Tag className="size-3" />
          {program.isSellable ? "Edit Listing" : "Sell"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Program Listing</DialogTitle>
            <DialogDescription>
              Configure how &quot;{program.title}&quot; appears in the shop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="flex-1">Sell this program</Label>
              <button
                onClick={() => setIsSellable(!isSellable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSellable ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white transition-transform ${
                    isSellable ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isSellable && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (cents)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="2900 = $29.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {price && (
                    <p className="text-xs text-muted-foreground">
                      Display price: ${(parseInt(price) / 100).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="imageUrl"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f) => (
                      <Badge key={f} variant="secondary" className="gap-1">
                        {f}
                        <button
                          onClick={() => setFeatures(features.filter((x) => x !== f))}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add feature..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-border/50 bg-card px-3 py-2 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="12"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{program.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
