"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Star,
  Eye,
} from "lucide-react";
import {
  getBrandAssetsAction,
  uploadBrandAssetAction,
  deleteBrandAssetAction,
} from "@/actions/brand-asset.actions";

const ASSET_TYPES = [
  {
    type: "logo",
    label: "Primary Logo",
    description: "Main site logo (light backgrounds)",
    accepts: "image/png,image/svg+xml,image/webp",
  },
  {
    type: "logo_dark",
    label: "Dark Mode Logo",
    description: "Logo for dark backgrounds",
    accepts: "image/png,image/svg+xml,image/webp",
  },
  {
    type: "favicon",
    label: "Favicon",
    description: "Browser tab icon (32x32 or 16x16)",
    accepts: "image/png,image/svg+xml",
  },
  {
    type: "social_image",
    label: "Social Sharing Image",
    description: "Default image for social media shares (1200x630)",
    accepts: "image/jpeg,image/png,image/webp",
  },
  {
    type: "email_logo",
    label: "Email Logo",
    description: "Logo used in email templates",
    accepts: "image/png,image/svg+xml",
  },
  {
    type: "app_icon",
    label: "App Icon",
    description: "PWA/mobile app icon (512x512)",
    accepts: "image/png",
  },
  {
    type: "default_og_image",
    label: "Default OG Image",
    description: "Open Graph default image",
    accepts: "image/jpeg,image/png,image/webp",
  },
] as const;

interface BrandAsset {
  id: string;
  assetType: string;
  name: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  uploadedBy: { name: string };
  createdAt: string;
}

export default function BrandingClient() {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadAssets = async () => {
    setLoading(true);
    const result = await getBrandAssetsAction();
    if (result.success && result.data) {
      setAssets(result.data as unknown as BrandAsset[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleUpload = async (assetType: string) => {
    const input = fileRefs.current[assetType];
    const file = input?.files?.[0];
    if (!file) return;

    setUploading(assetType);
    await uploadBrandAssetAction(assetType, file);
    if (input) input.value = "";
    await loadAssets();
    setUploading(null);
  };

  const handleDelete = async (assetType: string) => {
    if (confirm("Remove this brand asset?")) {
      await deleteBrandAssetAction(assetType);
      await loadAssets();
    }
  };

  const getAssetForType = (type: string) =>
    assets.find((a) => a.assetType === type);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-border/50 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Brand Assets</h2>
        <p className="mt-1 text-muted-foreground">
          Manage logos, favicons, and other brand assets. Changes apply across
          the site.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ASSET_TYPES.map((assetType) => {
          const asset = getAssetForType(assetType.type);
          return (
            <Card key={assetType.type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-amber-500" />
                  <CardTitle className="text-base">
                    {assetType.label}
                  </CardTitle>
                </div>
                {asset && (
                  <Badge variant="default" className="bg-green-500/10 text-green-600">
                    Set
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  {assetType.description}
                </p>
                {asset ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border border-border/30 p-3">
                      <div className="size-12 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {asset.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(asset.fileSize)} &middot;{" "}
                          {asset.uploadedBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewAsset(asset)}
                      >
                        <Eye className="mr-1 size-3" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          fileRefs.current[assetType.type]?.click()
                        }
                        disabled={uploading === assetType.type}
                      >
                        <Upload className="mr-1 size-3" />
                        Replace
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(assetType.type)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-xl border border-dashed py-6 text-center">
                    <ImageIcon className="mb-2 size-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No asset uploaded
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        fileRefs.current[assetType.type]?.click()
                      }
                      disabled={uploading === assetType.type}
                    >
                      {uploading === assetType.type ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 size-4" />
                      )}
                      Upload
                    </Button>
                  </div>
                )}
                <input
                  ref={(el) => {
                    fileRefs.current[assetType.type] = el;
                  }}
                  type="file"
                  accept={assetType.accepts}
                  className="hidden"
                  onChange={() => handleUpload(assetType.type)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={!!previewAsset}
        onOpenChange={(open) => !open && setPreviewAsset(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
          </DialogHeader>
          {previewAsset && (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-lg bg-muted p-8">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-h-64 object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{previewAsset.assetType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {formatFileSize(previewAsset.fileSize)}
                  </p>
                </div>
                {previewAsset.width && previewAsset.height && (
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {previewAsset.width} x {previewAsset.height}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Uploaded by</p>
                  <p className="font-medium">
                    {previewAsset.uploadedBy.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
