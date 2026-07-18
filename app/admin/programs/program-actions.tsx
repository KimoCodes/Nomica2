"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Difficulty } from "@prisma/client";

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
  X,
} from "lucide-react";

import { trackLoading } from "@/components/ui/loading-bar";

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

  // ✅ FIX: keep UI state as string (safe for select)
  const [difficulty, setDifficulty] = useState<string | null>(
    program.difficulty ?? null
  );

  const [duration, setDuration] = useState(
    program.duration?.toString() ?? ""
  );

  async function handleSave() {
    setIsPending(true);

    const result = await trackLoading(() => updateProgramSellableAction(program.id, {
      isSellable,
      price: price ? parseInt(price) : null,
      imageUrl: imageUrl || null,
      features,

      // ✅ FIXED: convert string → Prisma enum safely
      difficulty: difficulty
        ? (difficulty as Difficulty)
        : null,

      duration: duration ? parseInt(duration) : null,
    }));

    if (result.success) {
      setShowEditDialog(false);
      router.refresh();
    }

    setIsPending(false);
  }

  async function handleDelete() {
    setIsPending(true);

    const result = await trackLoading(() => deleteProgramAction(program.id));

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

      {/* EDIT DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Program Listing</DialogTitle>
            <DialogDescription>
              Configure how “{program.title}” appears in the shop.
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
                  <Label>Price (cents)</Label>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="2900 = $29.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image URL</Label>

                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
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
                          onClick={() =>
                            setFeatures(features.filter((x) => x !== f))
                          }
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addFeature())
                      }
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFeature}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>

                    <select
                      value={difficulty ?? ""}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="flex h-10 w-full rounded-xl border px-3 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (weeks)</Label>

                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete “{program.title}”?
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
              {isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
