"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function ClientMediaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function applyFilters(type?: string | null, searchVal?: string | null) {
    const params = new URLSearchParams();
    if (type && type !== "all") params.set("type", type);
    if (searchVal) params.set("search", searchVal);
    router.push(`/client/media?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilters(
                searchParams.get("type") ?? undefined,
                search,
              );
            }
          }}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(v) => applyFilters(v === "all" ? undefined : v, search || undefined)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="WORKOUT_VIDEO">Workout Videos</SelectItem>
          <SelectItem value="EXERCISE_DEMO">Exercise Demos</SelectItem>
          <SelectItem value="TRAINING_IMAGE">Training Images</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => {
          setSearch("");
          router.push("/client/media");
        }}
      >
        Clear
      </Button>
    </div>
  );
}
