"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  unlockedAt?: string;
};

type BadgesDisplayProps = {
  badges: BadgeItem[];
  totalPoints: number;
  nextBadge?: {
    name: string;
    current: number;
    needed: number;
  } | null;
};

const categoryColors: Record<string, string> = {
  workout: "bg-blue-100 text-blue-800",
  streak: "bg-orange-100 text-orange-800",
  milestone: "bg-green-100 text-green-800",
  social: "bg-purple-100 text-purple-800",
  special: "bg-yellow-100 text-yellow-800",
};

export function BadgesDisplay({ badges, totalPoints, nextBadge }: BadgesDisplayProps) {
  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const lockedBadges = badges.filter((b) => !b.unlockedAt);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Badges & Points
          </CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            {totalPoints} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {nextBadge && (
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Next: {nextBadge.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <Progress
                value={(nextBadge.current / (nextBadge.current + nextBadge.needed)) * 100}
                className="h-2 flex-1"
              />
              <span className="text-xs text-muted-foreground">
                {nextBadge.current}/{nextBadge.current + nextBadge.needed}
              </span>
            </div>
          </div>
        )}

        {unlockedBadges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Unlocked ({unlockedBadges.length})</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center rounded-lg border p-3 text-center",
                    "bg-gradient-to-b from-background to-muted/50"
                  )}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="mt-1 text-xs font-medium">{badge.name}</p>
                  <Badge className={cn("mt-1 text-[10px]", categoryColors[badge.category])}>
                    {badge.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Locked ({lockedBadges.length})
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {lockedBadges.slice(0, 6).map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center rounded-lg border border-dashed p-3 text-center opacity-50"
                >
                  <div className="relative">
                    <span className="text-2xl grayscale">{badge.icon}</span>
                    <Lock className="absolute -right-1 -top-1 h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-xs font-medium">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {badge.requirement} required
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
