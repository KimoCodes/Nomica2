"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Download, Trash2 } from "lucide-react";

type PrivacySettingsProps = {
  isTransformationPublic?: boolean;
  onToggleTransformation?: (isPublic: boolean) => void;
  onExportData?: () => void;
  onDeleteAccount?: () => void;
};

export function PrivacySettings({
  isTransformationPublic = false,
  onToggleTransformation,
  onExportData,
  onDeleteAccount,
}: PrivacySettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>Control your data and privacy preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Transformation Visibility</p>
            <p className="text-xs text-muted-foreground">
              Control whether your transformation story is visible to others
            </p>
          </div>
          <Button
            variant={isTransformationPublic ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleTransformation?.(!isTransformationPublic)}
          >
            {isTransformationPublic ? (
              <><Eye className="mr-1 h-3 w-3" /> Public</>
            ) : (
              <><EyeOff className="mr-1 h-3 w-3" /> Private</>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Export Your Data</p>
            <p className="text-xs text-muted-foreground">
              Download a copy of all your fitness data in JSON format
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onExportData}>
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-red-200 p-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
          {!showDeleteConfirm ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={onDeleteAccount}>
                Confirm Delete
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1">Info</Badge>
            Your data is encrypted and stored securely. We never sell personal data to third parties.
            You can request a full data export or deletion at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
