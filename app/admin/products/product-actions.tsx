"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductActiveAction,
} from "@/actions/product-admin.actions";
import { trackLoading } from "@/components/ui/loading-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  tagline: string | null;
  description: string | null;
  priceCents: number;
  compareAtCents: number | null;
  durationLabel: string | null;
  durationWeeks: number | null;
  durationDays: number | null;
  daysPerWeek: number | null;
  focus: string | null;
  features: string[];
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  programId: string | null;
  _count: { purchases: number; reviews: number };
};

type Program = { id: string; title: string };

type ProductFormProps = {
  product?: Product;
  programs: Program[];
  onSave: () => void;
  onCancel: () => void;
};

function ProductForm({ product, programs, onSave, onCancel }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>(product?.features || []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const input = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      kind: formData.get("kind") as "PROGRAM" | "CHALLENGE" | "BUNDLE",
      tagline: formData.get("tagline") as string,
      description: formData.get("description") as string,
      priceCents: Math.round(parseFloat(formData.get("price") as string) * 100),
      compareAtCents: formData.get("compareAtPrice")
        ? Math.round(parseFloat(formData.get("compareAtPrice") as string) * 100)
        : undefined,
      durationLabel: formData.get("durationLabel") as string,
      durationWeeks: formData.get("durationWeeks")
        ? parseInt(formData.get("durationWeeks") as string)
        : undefined,
      durationDays: formData.get("durationDays")
        ? parseInt(formData.get("durationDays") as string)
        : undefined,
      daysPerWeek: formData.get("daysPerWeek")
        ? parseInt(formData.get("daysPerWeek") as string)
        : undefined,
      focus: (formData.get("focus") as string || undefined) as "SWEAT" | "SCULPT" | "CLIMB" | undefined,
      features,
      imageUrl: formData.get("imageUrl") as string,
      isActive: formData.get("isActive") === "on",
      sortOrder: formData.get("sortOrder")
        ? parseInt(formData.get("sortOrder") as string)
        : 0,
      programId: formData.get("programId") as string || undefined,
    };

    const result = await trackLoading(() =>
      product
        ? updateProductAction(product.id, input)
        : createProductAction(input)
    );

    if (!result.success) {
      setError(result.error?.message ?? "Failed to save product");
      setLoading(false);
      return;
    }

    toast.success(product ? "Product updated" : "Product created");
    onSave();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={product?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="auto-generated" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kind">Kind *</Label>
          <select
            id="kind"
            name="kind"
            required
            defaultValue={product?.kind || "PROGRAM"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PROGRAM">Program</option>
            <option value="CHALLENGE">Challenge</option>
            <option value="BUNDLE">Bundle</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" defaultValue={product?.tagline ?? ""} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input id="price" name="price" type="number" step="0.01" required defaultValue={product ? product.priceCents / 100 : ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Compare At Price ($)</Label>
          <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" defaultValue={product?.compareAtCents ? product.compareAtCents / 100 : ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationLabel">Duration Label</Label>
          <Input id="durationLabel" name="durationLabel" defaultValue={product?.durationLabel ?? ""} placeholder="e.g., 8 weeks" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationWeeks">Duration (weeks)</Label>
          <Input id="durationWeeks" name="durationWeeks" type="number" defaultValue={product?.durationWeeks ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationDays">Duration (days)</Label>
          <Input id="durationDays" name="durationDays" type="number" defaultValue={product?.durationDays ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="daysPerWeek">Days per Week</Label>
          <Input id="daysPerWeek" name="daysPerWeek" type="number" defaultValue={product?.daysPerWeek ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="focus">Focus</Label>
          <select
            id="focus"
            name="focus"
            defaultValue={product?.focus || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            <option value="SWEAT">Sweat</option>
            <option value="SCULPT">Sculpt</option>
            <option value="CLIMB">Climb</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={product?.imageUrl ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="programId">Linked Program</Label>
          <select
            id="programId"
            name="programId"
            defaultValue={product?.programId || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" id="isActive" name="isActive" defaultChecked={product?.isActive ?? true} className="rounded" />
          <Label htmlFor="isActive">Active (visible on storefront)</Label>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label>Features</Label>
        <div className="flex flex-wrap gap-2">
          {features.map((f, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {f}
              <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="newFeature"
            placeholder="Add a feature"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value.trim()) {
                  setFeatures([...features, input.value.trim()]);
                  input.value = "";
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.getElementById("newFeature") as HTMLInputElement;
              if (input?.value.trim()) {
                setFeatures([...features, input.value.trim()]);
                input.value = "";
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProductActions({
  product,
  programs,
}: {
  product: Product;
  programs: Program[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await trackLoading(() => deleteProductAction(product.id));
    if (result.success) {
      toast.success("Product deleted");
      setDeleteOpen(false);
      router.refresh();
    } else {
      toast.error(result.error?.message ?? "Failed to delete");
    }
    setDeleting(false);
  }

  async function handleToggleActive() {
    const result = await trackLoading(() => toggleProductActiveAction(product.id));
    if (result.success) {
      toast.success(result.data?.isActive ? "Product activated" : "Product deactivated");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={handleToggleActive}>
        {product.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
        <Trash2 className="size-4 text-destructive" />
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={product}
            programs={programs}
            onSave={() => { setEditOpen(false); router.refresh(); }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
              {product._count.purchases > 0 && (
                <span className="mt-2 block text-destructive font-medium">
                  This product has {product._count.purchases} purchases and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || product._count.purchases > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CreateProductButton({ programs }: { programs: Program[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4" />
        Add Product
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            programs={programs}
            onSave={() => { setOpen(false); router.refresh(); }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
