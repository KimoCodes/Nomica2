"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Film, ImageIcon, Layers, TrendingUp } from "lucide-react";

type MediaStatsProps = {
  stats: {
    total: number;
    videos: number;
    images: number;
    byType: { type: string; count: number }[];
  };
};

export function MediaStats({ stats }: MediaStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card className="animate-slide-up stagger-1 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Media</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5 icon-hover">
              <Layers className="size-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-slide-up stagger-2 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Videos</p>
              <p className="text-3xl font-bold">{stats.videos}</p>
            </div>
            <div className="rounded-xl bg-chart-3/10 p-2.5 icon-hover">
              <Film className="size-5 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-slide-up stagger-3 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Images</p>
              <p className="text-3xl font-bold">{stats.images}</p>
            </div>
            <div className="rounded-xl bg-success/10 p-2.5 icon-hover">
              <ImageIcon className="size-5 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="animate-slide-up stagger-4 card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Types</p>
              <p className="text-3xl font-bold">{stats.byType.length}</p>
            </div>
            <div className="rounded-xl bg-chart-5/10 p-2.5 icon-hover">
              <TrendingUp className="size-5 text-chart-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
