"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Plus,
  Trash2,
  Eye,
  ArrowUpDown,
  Loader2,
  Undo,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import {
  getAdminPageContentAction,
  upsertPageContentAction,
  publishPageContentAction,
  unpublishPageContentAction,
  deletePageContentAction,
  getPageContentVersionsAction,
  rollbackPageContentAction,
} from "@/actions/page-content.actions";
import { getWebsiteMediaAction } from "@/actions/website-media.actions";
import { WebsiteMediaStatus } from "@prisma/client";

const PAGE_LABELS: Record<string, string> = {
  home: "Homepage",
  pricing: "Pricing",
  club: "Sculpt Club",
  bundles: "Bundles",
  programs: "Programs",
  transformations: "Transformations",
  "free-guide": "Free Guide",
  "coming-soon": "Coming Soon",
};

interface ContentSection {
  id: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  heading: string | null;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  cta2Text: string | null;
  cta2Link: string | null;
  badge: string | null;
  mediaId: string | null;
  sortOrder: number;
  isActive: boolean;
  status: WebsiteMediaStatus;
  version: number;
}

interface MediaOption {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
}

const SECTION_PRESETS: Record<string, { key: string; title: string }[]> = {
  home: [
    { key: "hero", title: "Hero Section" },
    { key: "hero_preview", title: "Hero Preview Card" },
    { key: "pain_points", title: "Problem/Agitation" },
    { key: "how_it_works", title: "How It Works" },
    { key: "video_showcase", title: "Video Showcase" },
    { key: "why_it_works", title: "Why It Works" },
    { key: "sculpt_club", title: "Sculpt Club / All Access" },
    { key: "pricing_comparison", title: "Pricing Comparison" },
    { key: "lead_magnet", title: "Lead Magnet" },
    { key: "faq", title: "FAQ" },
    { key: "final_cta", title: "Final CTA" },
  ],
  pricing: [
    { key: "hero", title: "Hero Section" },
    { key: "trust_signals", title: "Trust Signals" },
    { key: "faq", title: "FAQ" },
    { key: "cta", title: "Final CTA" },
  ],
  club: [
    { key: "hero", title: "Hero Section" },
    { key: "features", title: "Features" },
    { key: "guarantee", title: "Guarantee" },
    { key: "faq", title: "FAQ" },
    { key: "final_cta", title: "Final CTA" },
  ],
  bundles: [
    { key: "hero", title: "Hero Section" },
    { key: "value_props", title: "Value Propositions" },
    { key: "cta", title: "Final CTA" },
  ],
  programs: [
    { key: "hero", title: "Hero Section" },
    { key: "cta", title: "Final CTA" },
  ],
  transformations: [
    { key: "hero", title: "Hero Section" },
    { key: "cta", title: "Final CTA" },
  ],
  "free-guide": [
    { key: "hero", title: "Hero Section" },
    { key: "features", title: "Features" },
    { key: "whats_inside", title: "What's Inside" },
    { key: "perfect_if", title: "Perfect If..." },
  ],
  "coming-soon": [
    { key: "hero", title: "Hero Section" },
  ],
};

export default function PageContentEditorClient({
  pageSlug,
}: {
  pageSlug: string;
}) {
  const router = useRouter();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [showVersions, setShowVersions] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [mediaDialogSection, setMediaDialogSection] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [contentResult, mediaResult] = await Promise.all([
      getAdminPageContentAction(pageSlug),
      getWebsiteMediaAction({ status: "PUBLISHED", limit: 100 }),
    ]);
    if (contentResult.success && Array.isArray(contentResult.data)) {
      setSections(contentResult.data as ContentSection[]);
    }
    if (mediaResult.success && mediaResult.data && typeof mediaResult.data === "object" && "items" in mediaResult.data) {
      const data = mediaResult.data as { items: MediaOption[] };
      setMediaOptions(data.items);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [pageSlug]);

  const handleSaveSection = async (section: ContentSection) => {
    setSaving(true);
    await upsertPageContentAction({
      pageSlug,
      sectionKey: section.sectionKey,
      title: section.title || undefined,
      subtitle: section.subtitle || undefined,
      heading: section.heading || undefined,
      description: section.description || undefined,
      ctaText: section.ctaText || undefined,
      ctaLink: section.ctaLink || undefined,
      cta2Text: section.cta2Text || undefined,
      cta2Link: section.cta2Link || undefined,
      badge: section.badge || undefined,
      mediaId: section.mediaId || undefined,
      sortOrder: section.sortOrder,
      isActive: section.isActive,
    });
    setEditingSection(null);
    await loadData();
    setSaving(false);
  };

  const handlePublishSection = async (id: string) => {
    await publishPageContentAction(id);
    await loadData();
  };

  const handleUnpublishSection = async (id: string) => {
    await unpublishPageContentAction(id);
    await loadData();
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm("Delete this section? This cannot be undone.")) {
      await deletePageContentAction(id);
      await loadData();
    }
  };

  const handleAddSection = async () => {
    if (!newSectionKey || !newSectionTitle) return;
    setSaving(true);
    await upsertPageContentAction({
      pageSlug,
      sectionKey: newSectionKey,
      title: newSectionTitle,
      sortOrder: sections.length,
      isActive: true,
    });
    setShowAddSection(false);
    setNewSectionKey("");
    setNewSectionTitle("");
    await loadData();
    setSaving(false);
  };

  const handleLoadVersions = async (contentId: string) => {
    const result = await getPageContentVersionsAction(contentId);
    if (result.success && Array.isArray(result.data)) {
      setVersions(result.data);
      setShowVersions(contentId);
    }
  };

  const handleRollback = async (contentId: string, versionId: string) => {
    if (confirm("Rollback to this version? Current changes will be saved as a new version.")) {
      await rollbackPageContentAction(contentId, versionId);
      setShowVersions(null);
      await loadData();
    }
  };

  const updateSection = (
    index: number,
    field: keyof ContentSection,
    value: unknown,
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    );
  };

  const presets = SECTION_PRESETS[pageSlug] || [];
  const usedKeys = new Set(sections.map((s) => s.sectionKey));
  const availablePresets = presets.filter((p) => !usedKeys.has(p.key));

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {PAGE_LABELS[pageSlug] || pageSlug} Content
          </h3>
          <p className="text-sm text-muted-foreground">
            {sections.length} sections configured
          </p>
        </div>
        <Button onClick={() => setShowAddSection(true)}>
          <Plus className="mr-2 size-4" />
          Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card
            key={section.id}
            className="transition-all hover:shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <GripVertical className="size-4 text-muted-foreground/30" />
                <div>
                  <CardTitle className="text-base">
                    {section.title || section.sectionKey}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {section.sectionKey} &middot; v{section.version}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    section.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {section.status}
                </Badge>
                {section.status === "DRAFT" ? (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs"
                    onClick={() => handlePublishSection(section.id)}
                  >
                    <Eye className="mr-1 size-3" />
                    Publish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleUnpublishSection(section.id)}
                  >
                    Unpublish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => handleLoadVersions(section.id)}
                >
                  <Undo className="size-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive"
                  onClick={() => handleDeleteSection(section.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === section.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={section.title || ""}
                        onChange={(e) =>
                          updateSection(index, "title", e.target.value)
                        }
                        placeholder="Section title"
                      />
                    </div>
                    <div>
                      <Label>Subtitle</Label>
                      <Input
                        value={section.subtitle || ""}
                        onChange={(e) =>
                          updateSection(index, "subtitle", e.target.value)
                        }
                        placeholder="Section subtitle"
                      />
                    </div>
                    <div>
                      <Label>Heading</Label>
                      <Input
                        value={section.heading || ""}
                        onChange={(e) =>
                          updateSection(index, "heading", e.target.value)
                        }
                        placeholder="Main heading"
                      />
                    </div>
                    <div>
                      <Label>Badge</Label>
                      <Input
                        value={section.badge || ""}
                        onChange={(e) =>
                          updateSection(index, "badge", e.target.value)
                        }
                        placeholder="e.g. MOST POPULAR"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={section.description || ""}
                      onChange={(e) =>
                        updateSection(index, "description", e.target.value)
                      }
                      placeholder="Section description or body text"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>CTA Text</Label>
                      <Input
                        value={section.ctaText || ""}
                        onChange={(e) =>
                          updateSection(index, "ctaText", e.target.value)
                        }
                        placeholder="e.g. Get Started"
                      />
                    </div>
                    <div>
                      <Label>CTA Link</Label>
                      <Input
                        value={section.ctaLink || ""}
                        onChange={(e) =>
                          updateSection(index, "ctaLink", e.target.value)
                        }
                        placeholder="e.g. /register"
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Text</Label>
                      <Input
                        value={section.cta2Text || ""}
                        onChange={(e) =>
                          updateSection(index, "cta2Text", e.target.value)
                        }
                        placeholder="e.g. Learn More"
                      />
                    </div>
                    <div>
                      <Label>Secondary CTA Link</Label>
                      <Input
                        value={section.cta2Link || ""}
                        onChange={(e) =>
                          updateSection(index, "cta2Link", e.target.value)
                        }
                        placeholder="e.g. /pricing"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Media</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={section.mediaId || ""}
                        onValueChange={(v) =>
                          updateSection(index, "mediaId", v || null)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select from Media Library" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No media</SelectItem>
                          {mediaOptions.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection(section)}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer rounded-lg border border-dashed border-transparent p-3 transition-colors hover:border-border hover:bg-accent/20"
                  onClick={() => setEditingSection(section.id)}
                >
                  <div className="space-y-1">
                    {section.heading && (
                      <p className="font-medium">{section.heading}</p>
                    )}
                    {section.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    )}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {section.ctaText && <span>CTA: {section.ctaText}</span>}
                      {section.mediaId && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="size-3" />
                          Media attached
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Click to edit
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Content Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availablePresets.length > 0 && (
              <div>
                <Label>Quick Add (Suggested)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availablePresets.map((preset) => (
                    <Button
                      key={preset.key}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewSectionKey(preset.key);
                        setNewSectionTitle(preset.title);
                      }}
                    >
                      {preset.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label>Section Key</Label>
              <Input
                value={newSectionKey}
                onChange={(e) => setNewSectionKey(e.target.value)}
                placeholder="e.g. hero, features, faq"
              />
            </div>
            <div>
              <Label>Section Title</Label>
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g. Hero Section"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSection(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionKey || !newSectionTitle || saving}
            >
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!showVersions}
        onOpenChange={(open) => !open && setShowVersions(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {versions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No version history available
              </p>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Version {version.version}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {version.createdBy.name} &middot;{" "}
                      {new Date(version.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {version.version !== versions[0]?.version && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        showVersions &&
                        handleRollback(showVersions, version.id)
                      }
                    >
                      <Undo className="mr-1 size-3" />
                      Restore
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
