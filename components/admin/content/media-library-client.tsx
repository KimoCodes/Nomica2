"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Search,
  Image as ImageIcon,
  Video,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  Loader2,
  Filter,
  Grid,
  List,
  MoreVertical,
  X,
} from "lucide-react";
import {
  uploadWebsiteMediaAction,
  getWebsiteMediaAction,
  updateWebsiteMediaAction,
  publishWebsiteMediaAction,
  archiveWebsiteMediaAction,
  deleteWebsiteMediaAction,
} from "@/actions/website-media.actions";
import { WebsiteMediaCategory, WebsiteMediaStatus } from "@prisma/client";

const CATEGORY_LABELS: Record<WebsiteMediaCategory, string> = {
  HOMEPAGE: "Homepage",
  WELCOME: "Welcome",
  PROGRAMS: "Programs",
  BUNDLES: "Bundles",
  SCULPT_CLUB: "Sculpt Club",
  PRICING: "Pricing",
  ABOUT: "About",
  PROMOTIONAL: "Promotional",
  BRANDING: "Branding",
  GENERAL: "General",
};

const STATUS_COLORS: Record<WebsiteMediaStatus, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-600",
  PUBLISHED: "bg-green-500/10 text-green-600",
  ARCHIVED: "bg-gray-500/10 text-gray-600",
};

interface MediaItem {
  id: string;
  name: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  category: WebsiteMediaCategory;
  status: WebsiteMediaStatus;
  version: number;
  createdAt: string;
  uploadedBy: { name: string };
}

export default function MediaLibraryClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<WebsiteMediaCategory>("GENERAL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadMedia = async (p = page) => {
    setLoading(true);
    const result = await getWebsiteMediaAction({
      category:
        categoryFilter !== "all"
          ? (categoryFilter as WebsiteMediaCategory)
          : undefined,
      status:
        statusFilter !== "all"
          ? (statusFilter as WebsiteMediaStatus)
          : undefined,
      search: search || undefined,
      page: p,
      limit: 20,
    });
    if (result.success && result.data && typeof result.data === "object" && "items" in result.data) {
      const data = result.data as { items: MediaItem[]; total: number };
      setMedia(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMedia(1);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !uploadName) return;
    setUploading(true);
    const result = await uploadWebsiteMediaAction(selectedFile, {
      name: uploadName,
      altText: uploadAltText || undefined,
      category: uploadCategory,
    });
    if (result.success) {
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadName("");
      setUploadAltText("");
      setUploadCategory("GENERAL");
      loadMedia(1);
      setPage(1);
      toast.success("Media uploaded");
    } else {
      toast.error(result.error?.message || "Failed to upload");
    }
    setUploading(false);
  };

  const handleAction = async (
    action: string,
    id: string,
  ) => {
    setActionLoading(id);
    let result;
    switch (action) {
      case "publish":
        result = await publishWebsiteMediaAction(id);
        break;
      case "archive":
        result = await archiveWebsiteMediaAction(id);
        break;
      case "delete":
        if (confirm("Are you sure you want to delete this media?")) {
          result = await deleteWebsiteMediaAction(id);
        }
        break;
    }
    if (result && result.success) {
      toast.success(`Media ${action === "delete" ? "deleted" : action === "publish" ? "published" : "archived"}`);
    } else if (result && !result.success) {
      toast.error(result.error?.message || `Failed to ${action}`);
    }
    await loadMedia();
    setActionLoading(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="mt-1 text-muted-foreground">
            Upload and manage website media. {total} items total.
          </p>
        </div>
        <Dialog
          open={uploadDialogOpen}
          onOpenChange={(open) => {
            setUploadDialogOpen(open);
            if (!open) {
              setSelectedFile(null);
              setUploadName("");
              setUploadAltText("");
            }
          }}
        >
          <DialogTrigger
            render={
              <Button>
                <Upload className="mr-2 size-4" />
                Upload Media
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Website Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      if (!uploadName) setUploadName(file.name.replace(/\.[^.]+$/, ""));
                    }
                  }}
                />
                {selectedFile && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Homepage Hero Video"
                />
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="Description for accessibility"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={uploadCategory}
                  onValueChange={(v) =>
                    setUploadCategory(v as WebsiteMediaCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !uploadName || uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                loadMedia(1);
              }
            }}
          />
        </div>
        <Select
          value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v || "all");
                    setPage(1);
                  }}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 size-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v || "all");
                    setPage(1);
                  }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-border">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <Grid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="mt-2 h-3 w-1/2 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="mb-4 size-12 text-muted-foreground/30" />
            <p className="text-lg font-medium">No media found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Upload your first website media to get started"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden transition-all hover:shadow-md"
            >
              <div className="relative aspect-video bg-muted">
                {isVideo(item.mimeType) ? (
                  <div className="flex size-full items-center justify-center">
                    <Video className="size-10 text-muted-foreground/30" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.altText || item.name}
                    className="size-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPreviewItem(item)}
                  >
                    <Eye className="mr-1 size-3" />
                    Preview
                  </Button>
                </div>
                <Badge
                  className={`absolute right-2 top-2 ${STATUS_COLORS[item.status]}`}
                >
                  {item.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[item.category]} &middot;{" "}
                      {formatFileSize(item.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1">
                  {item.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={() => handleAction("publish", item.id)}
                      disabled={actionLoading === item.id}
                    >
                      <CheckCircle className="mr-1 size-3" />
                      Publish
                    </Button>
                  )}
                  {item.status === "PUBLISHED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleAction("archive", item.id)}
                      disabled={actionLoading === item.id}
                    >
                      <Archive className="mr-1 size-3" />
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive"
                    onClick={() => handleAction("delete", item.id)}
                    disabled={actionLoading === item.id}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {isVideo(item.mimeType) ? (
                      <div className="flex size-full items-center justify-center">
                        <Video className="size-4 text-muted-foreground/30" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.altText || item.name}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[item.category]} &middot;{" "}
                      {formatFileSize(item.fileSize)} &middot; v{item.version}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[item.status]}>
                    {item.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewItem(item)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    {item.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAction("publish", item.id)}
                        disabled={actionLoading === item.id}
                      >
                        <CheckCircle className="size-4 text-green-500" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAction("delete", item.id)}
                      disabled={actionLoading === item.id}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const p = page - 1;
              setPage(p);
              loadMedia(p);
            }}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const p = page + 1;
              setPage(p);
              loadMedia(p);
            }}
            disabled={page >= Math.ceil(total / 20)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.name}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg bg-muted">
                {isVideo(previewItem.mimeType) ? (
                  <video
                    src={previewItem.url}
                    controls
                    className="w-full"
                    poster={previewItem.thumbnailUrl || undefined}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewItem.url}
                    alt={previewItem.altText || previewItem.name}
                    className="w-full object-contain"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {CATEGORY_LABELS[previewItem.category]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[previewItem.status]}>
                    {previewItem.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {formatFileSize(previewItem.fileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">v{previewItem.version}</p>
                </div>
                {previewItem.width && previewItem.height && (
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {previewItem.width} x {previewItem.height}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Uploaded by</p>
                  <p className="font-medium">
                    {previewItem.uploadedBy.name}
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
