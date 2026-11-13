"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateWebsiteAccessSettingsAction, addApprovedIpAddressAction, removeApprovedIpAddressAction } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type WebsiteAccessSettingsSnapshot = {
  websiteAccessMode: "NORMAL" | "COMING_SOON" | "MAINTENANCE";
  publicAccessRestrictionEnabled: boolean;
  comingSoonHeadline: string | null;
  comingSoonMessage: string | null;
  comingSoonLaunchAt: string | null;
  comingSoonTimezone: string | null;
  comingSoonAutoSwitch: boolean;
  maintenanceHeadline: string | null;
  maintenanceMessage: string | null;
  maintenanceReturnAt: string | null;
  maintenanceTimezone: string | null;
  approvedIpAddresses: Array<{
    id: string;
    value: string;
    label: string | null;
    createdAt: string;
  }>;
};

const modeOptions = [
  { value: "NORMAL", label: "Normal Mode" },
  { value: "COMING_SOON", label: "Coming Soon Mode" },
  { value: "MAINTENANCE", label: "Maintenance Mode" },
] as const;

function toDateTimeLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function WebsiteAccessManager({
  initialSettings,
  detectedPublicIp,
}: {
  initialSettings: WebsiteAccessSettingsSnapshot;
  detectedPublicIp: string;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [ipForm, setIpForm] = useState({ value: "", label: "" });
  const [ipSaving, setIpSaving] = useState(false);

  async function handleSave() {
    if (settings.publicAccessRestrictionEnabled && settings.approvedIpAddresses.length === 0) {
      toast.error("Add at least one approved IP before enabling IP-based restrictions");
      return;
    }

    setSaving(true);
    try {
      const result = await updateWebsiteAccessSettingsAction({
        websiteAccessMode: settings.websiteAccessMode,
        publicAccessRestrictionEnabled: settings.publicAccessRestrictionEnabled,
        comingSoonHeadline: settings.comingSoonHeadline?.trim() ? settings.comingSoonHeadline : null,
        comingSoonMessage: settings.comingSoonMessage?.trim() ? settings.comingSoonMessage : null,
        comingSoonLaunchAt: settings.comingSoonLaunchAt ?? null,
        comingSoonTimezone: settings.comingSoonTimezone?.trim() || "UTC",
        comingSoonAutoSwitch: settings.comingSoonAutoSwitch,
        maintenanceHeadline: settings.maintenanceHeadline?.trim() ? settings.maintenanceHeadline : null,
        maintenanceMessage: settings.maintenanceMessage?.trim() ? settings.maintenanceMessage : null,
        maintenanceReturnAt: settings.maintenanceReturnAt ?? null,
        maintenanceTimezone: settings.maintenanceTimezone?.trim() || "UTC",
      });

      if (result.success) {
        toast.success("Website access settings saved");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Could not save website access settings");
      }
    } catch {
      toast.error("Could not save website access settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddIp() {
    if (!ipForm.value.trim()) {
      toast.error("Enter an IP address or CIDR range");
      return;
    }

    setIpSaving(true);
    try {
      const result = await addApprovedIpAddressAction({
        value: ipForm.value.trim(),
        label: ipForm.label.trim() || undefined,
      });

      if (result.success) {
        setIpForm({ value: "", label: "" });
        toast.success("Approved IP added");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Could not add approved IP");
      }
    } catch {
      toast.error("Could not add approved IP");
    } finally {
      setIpSaving(false);
    }
  }

  async function handleRemoveIp(id: string) {
    try {
      const result = await removeApprovedIpAddressAction(id);
      if (result.success) {
        toast.success("Approved IP removed");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Could not remove approved IP");
      }
    } catch {
      toast.error("Could not remove approved IP");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Access Management</CardTitle>
          <CardDescription>Control public site availability and approved administrator IP access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Current detected public IP</p>
            <p className="mt-2 text-lg font-semibold">{detectedPublicIp}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Website availability mode</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {modeOptions.map((option) => {
                const active = settings.websiteAccessMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSettings((previous) => ({ ...previous, websiteAccessMode: option.value }))}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-accent/30"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="mt-1 text-xs opacity-80">
                      {option.value === "NORMAL" && "Public site available"}
                      {option.value === "COMING_SOON" && "Public launch landing page"}
                      {option.value === "MAINTENANCE" && "Public maintenance page"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="font-medium">IP-based public access restrictions</div>
              <div className="text-sm text-muted-foreground">
                Require approved IPs for public pages. Administrator and staff-coach sessions always
                keep access.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.publicAccessRestrictionEnabled}
              onClick={() => {
                if (!settings.publicAccessRestrictionEnabled && settings.approvedIpAddresses.length === 0) {
                  toast.error("Add at least one approved IP before enabling IP-based restrictions");
                  return;
                }
                setSettings((previous) => ({ ...previous, publicAccessRestrictionEnabled: !previous.publicAccessRestrictionEnabled }));
              }}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${settings.publicAccessRestrictionEnabled ? "bg-primary" : "bg-muted border border-border"}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${settings.publicAccessRestrictionEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coming soon headline</label>
              <input
                value={settings.comingSoonHeadline ?? ""}
                onChange={(event) => setSettings((previous) => ({ ...previous, comingSoonHeadline: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coming soon timezone</label>
              <input
                value={settings.comingSoonTimezone ?? "UTC"}
                onChange={(event) => setSettings((previous) => ({ ...previous, comingSoonTimezone: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Coming soon message</label>
              <textarea
                value={settings.comingSoonMessage ?? ""}
                onChange={(event) => setSettings((previous) => ({ ...previous, comingSoonMessage: event.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Launch date & time</label>
              <input
                type="datetime-local"
                value={toDateTimeLocalInput(settings.comingSoonLaunchAt)}
                onChange={(event) => setSettings((previous) => ({ ...previous, comingSoonLaunchAt: event.target.value ? new Date(event.target.value).toISOString() : null }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
              <div>
                <div className="font-medium">Auto-switch to Normal Mode</div>
                <div className="text-xs text-muted-foreground">Enable automatic return after launch time.</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.comingSoonAutoSwitch}
                onClick={() => setSettings((previous) => ({ ...previous, comingSoonAutoSwitch: !previous.comingSoonAutoSwitch }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${settings.comingSoonAutoSwitch ? "bg-primary" : "bg-muted border border-border"}`}
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${settings.comingSoonAutoSwitch ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance headline</label>
              <input
                value={settings.maintenanceHeadline ?? ""}
                onChange={(event) => setSettings((previous) => ({ ...previous, maintenanceHeadline: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance timezone</label>
              <input
                value={settings.maintenanceTimezone ?? "UTC"}
                onChange={(event) => setSettings((previous) => ({ ...previous, maintenanceTimezone: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Maintenance message</label>
              <textarea
                value={settings.maintenanceMessage ?? ""}
                onChange={(event) => setSettings((previous) => ({ ...previous, maintenanceMessage: event.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Estimated return date & time</label>
              <input
                type="datetime-local"
                value={toDateTimeLocalInput(settings.maintenanceReturnAt)}
                onChange={(event) => setSettings((previous) => ({ ...previous, maintenanceReturnAt: event.target.value ? new Date(event.target.value).toISOString() : null }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save website access settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved administrator IPs</CardTitle>
          <CardDescription>Add trusted IPs or CIDR ranges that retain admin access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto]">
            <input
              value={ipForm.label}
              onChange={(event) => setIpForm((previous) => ({ ...previous, label: event.target.value }))}
              placeholder="Label (optional)"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={ipForm.value}
              onChange={(event) => setIpForm((previous) => ({ ...previous, value: event.target.value }))}
              placeholder="192.168.1.10 or 10.0.0.0/8"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <Button type="button" onClick={handleAddIp} disabled={ipSaving}>
              {ipSaving ? "Adding..." : "Add IP"}
            </Button>
          </div>

          {settings.approvedIpAddresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No approved IP addresses yet.
            </div>
          ) : (
            <div className="space-y-2">
              {settings.approvedIpAddresses.map((ip) => (
                <div key={ip.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                  <div>
                    <div className="font-medium">{ip.label || "Approved IP"}</div>
                    <div className="text-sm text-muted-foreground">{ip.value}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveIp(ip.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
