"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

const MEDIA_TYPES = [
  { value: "all", label: "All Types" },
  { value: "WORKOUT_VIDEO", label: "Workout Videos" },
  { value: "EXERCISE_DEMO", label: "Exercise Demos" },
  { value: "TRAINING_IMAGE", label: "Training Images" },
  { value: "TRANSFORMATION", label: "Transformations" },
];

export function MediaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/coach/media?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search);
  }

  function clearFilters() {
    setSearch("");
    router.push("/coach/media");
  }

  const hasActiveFilters =
    searchParams.get("type") || searchParams.get("tag") || searchParams.get("search");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9"
        />
      </form>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(value) => updateParam("type", value)}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {MEDIA_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}
