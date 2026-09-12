"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  getThemesAction,
  createThemeAction,
  updateThemeAction,
  publishThemeAction,
  deleteThemeAction,
  getDefaultThemeAction,
  getPublishedThemeAction,
} from "@/actions/site-theme.actions";
import { ThemeMode } from "@prisma/client";
import type { SiteThemeInput } from "@/server/services/site-theme.service";

interface Theme {
  id: string;
  name: string;
  mode: ThemeMode;
  isPublished: boolean;
  primaryColor: string | null;
  primaryForeground: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  destructiveColor: string | null;
  successColor: string | null;
  warningColor: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  cardColor: string | null;
  mutedColor: string | null;
  mutedFgColor: string | null;
  borderColor: string | null;
  headingFont: string | null;
  bodyFont: string | null;
  baseFontSize: string | null;
  borderRadius: string | null;
  createdBy: { name: string };
}

const MODE_ICONS = {
  LIGHT: Sun,
  DARK: Moon,
  SYSTEM: Monitor,
};

const COLOR_FIELDS = [
  { key: "primaryColor", label: "Primary", group: "brand" },
  { key: "primaryForeground", label: "Primary Foreground", group: "brand" },
  { key: "secondaryColor", label: "Secondary", group: "brand" },
  { key: "accentColor", label: "Accent", group: "brand" },
  { key: "destructiveColor", label: "Destructive", group: "brand" },
  { key: "successColor", label: "Success", group: "brand" },
  { key: "warningColor", label: "Warning", group: "brand" },
  { key: "backgroundColor", label: "Background", group: "surface" },
  { key: "foregroundColor", label: "Foreground", group: "surface" },
  { key: "cardColor", label: "Card", group: "surface" },
  { key: "mutedColor", label: "Muted", group: "surface" },
  { key: "mutedFgColor", label: "Muted Foreground", group: "surface" },
  { key: "borderColor", label: "Border", group: "surface" },
] as const;

export default function ThemeManagerClient() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [previewMode, setPreviewMode] = useState<ThemeMode>("SYSTEM");

  const loadThemes = async () => {
    setLoading(true);
    const result = await getThemesAction();
    if (result.success && result.data) {
      setThemes(result.data as unknown as Theme[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleCreateTheme = async () => {
    if (!newThemeName) return;
    setSaving(true);
    const defaultResult = await getDefaultThemeAction();
    if (defaultResult.success && defaultResult.data && typeof defaultResult.data === "object") {
      await createThemeAction({
        ...(defaultResult.data as SiteThemeInput),
        name: newThemeName,
      });
    }
    setShowCreateDialog(false);
    setNewThemeName("");
    await loadThemes();
    setSaving(false);
  };

  const handlePublishTheme = async (id: string) => {
    setSaving(true);
    await publishThemeAction(id);
    await loadThemes();
    setSaving(false);
  };

  const handleDeleteTheme = async (id: string) => {
    if (confirm("Delete this theme? This cannot be undone.")) {
      setSaving(true);
      await deleteThemeAction(id);
      await loadThemes();
      setSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!editingTheme) return;
    setSaving(true);
    await updateThemeAction(editingTheme.id, {
      name: editingTheme.name,
      mode: editingTheme.mode,
      primaryColor: editingTheme.primaryColor || undefined,
      primaryForeground: editingTheme.primaryForeground || undefined,
      secondaryColor: editingTheme.secondaryColor || undefined,
      accentColor: editingTheme.accentColor || undefined,
      destructiveColor: editingTheme.destructiveColor || undefined,
      successColor: editingTheme.successColor || undefined,
      warningColor: editingTheme.warningColor || undefined,
      backgroundColor: editingTheme.backgroundColor || undefined,
      foregroundColor: editingTheme.foregroundColor || undefined,
      cardColor: editingTheme.cardColor || undefined,
      mutedColor: editingTheme.mutedColor || undefined,
      mutedFgColor: editingTheme.mutedFgColor || undefined,
      borderColor: editingTheme.borderColor || undefined,
      headingFont: editingTheme.headingFont || undefined,
      bodyFont: editingTheme.bodyFont || undefined,
      baseFontSize: editingTheme.baseFontSize || undefined,
      borderRadius: editingTheme.borderRadius || undefined,
    });
    await loadThemes();
    setSaving(false);
  };

  const updateThemeField = (
    field: keyof Theme,
    value: string | ThemeMode,
  ) => {
    if (!editingTheme) return;
    setEditingTheme({ ...editingTheme, [field]: value });
  };

  const publishedTheme = themes.find((t) => t.isPublished);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Theme Manager</h2>
          <p className="mt-1 text-muted-foreground">
            Control colors, fonts, and visual identity.{" "}
            {publishedTheme && (
              <span>
                Active: <Badge variant="default">{publishedTheme.name}</Badge>
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 size-4" />
          Create Theme
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const ModeIcon = MODE_ICONS[theme.mode];
          return (
            <Card
              key={theme.id}
              className={`card-hover-glow transition-all ${
                theme.isPublished ? "ring-2 ring-primary" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{theme.name}</CardTitle>
                  {theme.isPublished && (
                    <Badge className="bg-green-500/10 text-green-600">
                      Published
                    </Badge>
                  )}
                </div>
                <ModeIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-1">
                  {[
                    theme.primaryColor,
                    theme.backgroundColor,
                    theme.accentColor,
                    theme.cardColor,
                  ]
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((color, i) => (
                      <div
                        key={i}
                        className="size-6 rounded-full border border-border"
                        style={{ backgroundColor: color || undefined }}
                      />
                    ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTheme(theme)}
                  >
                    Edit
                  </Button>
                  {!theme.isPublished && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handlePublishTheme(theme.id)}
                        disabled={saving}
                      >
                        <CheckCircle className="mr-1 size-3" />
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteTheme(theme.id)}
                        disabled={saving}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Theme Name</Label>
              <Input
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="e.g. Dark Mode, Brand Theme"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTheme}
              disabled={!newThemeName || saving}
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              Create Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingTheme}
        onOpenChange={(open) => !open && setEditingTheme(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editingTheme?.name}</DialogTitle>
          </DialogHeader>
          {editingTheme && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingTheme.name}
                    onChange={(e) => updateThemeField("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select
                    value={editingTheme.mode}
                    onValueChange={(v) => updateThemeField("mode", v as ThemeMode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIGHT">Light</SelectItem>
                      <SelectItem value="DARK">Dark</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="brand">
                <TabsList>
                  <TabsTrigger value="brand">Brand Colors</TabsTrigger>
                  <TabsTrigger value="surface">Surface Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                </TabsList>
                <TabsContent value="brand" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {COLOR_FIELDS.filter((f) => f.group === "brand").map(
                      (field) => (
                        <div key={field.key}>
                          <Label>{field.label}</Label>
                          <div className="flex gap-2">
                            <Input
                              value={
                                (editingTheme[field.key] as string) || ""
                              }
                              onChange={(e) =>
                                updateThemeField(
                                  field.key as keyof Theme,
                                  e.target.value,
                                )
                              }
                              placeholder="oklch(...) or #hex"
                            />
                            {(editingTheme[field.key] as string) && (
                              <div
                                className="size-10 shrink-0 rounded border border-border"
                                style={{
                                  backgroundColor:
                                    editingTheme[field.key] || undefined,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="surface" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {COLOR_FIELDS.filter((f) => f.group === "surface").map(
                      (field) => (
                        <div key={field.key}>
                          <Label>{field.label}</Label>
                          <div className="flex gap-2">
                            <Input
                              value={
                                (editingTheme[field.key] as string) || ""
                              }
                              onChange={(e) =>
                                updateThemeField(
                                  field.key as keyof Theme,
                                  e.target.value,
                                )
                              }
                              placeholder="oklch(...) or #hex"
                            />
                            {(editingTheme[field.key] as string) && (
                              <div
                                className="size-10 shrink-0 rounded border border-border"
                                style={{
                                  backgroundColor:
                                    editingTheme[field.key] || undefined,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="typography" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Heading Font</Label>
                      <Input
                        value={editingTheme.headingFont || ""}
                        onChange={(e) =>
                          updateThemeField("headingFont", e.target.value)
                        }
                        placeholder="var(--font-heading)"
                      />
                    </div>
                    <div>
                      <Label>Body Font</Label>
                      <Input
                        value={editingTheme.bodyFont || ""}
                        onChange={(e) =>
                          updateThemeField("bodyFont", e.target.value)
                        }
                        placeholder="var(--font-sans)"
                      />
                    </div>
                    <div>
                      <Label>Base Font Size</Label>
                      <Input
                        value={editingTheme.baseFontSize || ""}
                        onChange={(e) =>
                          updateThemeField("baseFontSize", e.target.value)
                        }
                        placeholder="16px"
                      />
                    </div>
                    <div>
                      <Label>Border Radius</Label>
                      <Input
                        value={editingTheme.borderRadius || ""}
                        onChange={(e) =>
                          updateThemeField("borderRadius", e.target.value)
                        }
                        placeholder="0.625rem"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-sm font-medium">Preview</p>
                <div
                  className="mt-3 rounded-lg border border-border p-4"
                  style={{
                    backgroundColor:
                      editingTheme.backgroundColor || undefined,
                    color: editingTheme.foregroundColor || undefined,
                    borderColor: editingTheme.borderColor || undefined,
                    borderRadius: editingTheme.borderRadius || undefined,
                  }}
                >
                  <h4
                    className="text-lg font-bold"
                    style={{
                      color: editingTheme.primaryColor || undefined,
                    }}
                  >
                    Sample Heading
                  </h4>
                  <p className="mt-1 text-sm opacity-80">
                    This is how your content will appear with the selected
                    theme colors.
                  </p>
                  <button
                    className="mt-3 rounded px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor:
                        editingTheme.primaryColor || undefined,
                      color:
                        editingTheme.primaryForeground || undefined,
                      borderRadius:
                        editingTheme.borderRadius || undefined,
                    }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTheme(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTheme} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Theme
            </Button>
            {editingTheme && !editingTheme.isPublished && (
              <Button
                onClick={() => {
                  handlePublishTheme(editingTheme.id);
                  setEditingTheme(null);
                }}
                disabled={saving}
              >
                <CheckCircle className="mr-2 size-4" />
                Save & Publish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
