"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import {
  MUSCLE_GROUP_LABELS,
  DIFFICULTY_LABELS,
  MUSCLE_GROUP_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "@/constants/exercises";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dumbbell,
  Search,
  Play,
  Filter,
  X,
} from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
  instructions: string;
  videoUrl: string | null;
};

type ExerciseLibraryClientProps = {
  exercises: Exercise[];
  userName: string | null;
};

export function ExerciseLibraryClient({
  exercises,
  userName,
}: ExerciseLibraryClientProps) {
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    setIsSearching(true);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
      setIsSearching(false);
    }, 200);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.instructions.toLowerCase().includes(search.toLowerCase());
      const matchesMuscle = !selectedMuscle || ex.muscleGroup === selectedMuscle;
      const matchesDifficulty =
        !selectedDifficulty || ex.difficulty === selectedDifficulty;
      return matchesSearch && matchesMuscle && matchesDifficulty;
    });
  }, [exercises, search, selectedMuscle, selectedDifficulty]);

  const activeFilters =
    (selectedMuscle ? 1 : 0) + (selectedDifficulty ? 1 : 0);

  return (
    <DashboardLayout
      title="Exercise Library"
      navItems={[...CLIENT_NAV]}
      userName={userName ?? undefined}
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exercise Library</h2>
          <p className="mt-1 text-muted-foreground">
            Search by muscle group, equipment, or movement pattern.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              aria-label="Search exercises"
            />
            {isSearching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse-subtle">
                Searching...
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Filter className="size-4" />
            Filters
            {activeFilters > 0 && (
              <Badge className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFilters}
              </Badge>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="animate-slide-up">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Muscle Group</p>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_GROUP_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setSelectedMuscle(
                            selectedMuscle === opt.value ? null : opt.value,
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                          selectedMuscle === opt.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {opt.label}
                        {selectedMuscle === opt.value && (
                          <X className="size-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Difficulty</p>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setSelectedDifficulty(
                            selectedDifficulty === opt.value ? null : opt.value,
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                          selectedDifficulty === opt.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {opt.label}
                        {selectedDifficulty === opt.value && (
                          <X className="size-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setSelectedMuscle(null);
                      setSelectedDifficulty(null);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filtered.length} exercise{filtered.length === 1 ? "" : "s"} found
        </p>

        {/* Exercise Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <Dumbbell className="mb-4 size-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No exercises found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exercise, index) => (
              <Card
                key={exercise.id}
                className={`animate-slide-up stagger-${(index % 6) + 1} group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-premium`}
              >
                {exercise.videoUrl ? (
                  <div className="relative aspect-video bg-muted">
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover:scale-110">
                          <Play className="size-5 text-primary ml-0.5" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Watch demo
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-muted">
                    <div className="flex size-full items-center justify-center">
                      <Dumbbell className="size-10 text-muted-foreground/20" />
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{exercise.name}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="font-normal text-xs">
                      {MUSCLE_GROUP_LABELS[exercise.muscleGroup as keyof typeof MUSCLE_GROUP_LABELS]}
                    </Badge>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {DIFFICULTY_LABELS[exercise.difficulty as keyof typeof DIFFICULTY_LABELS]}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {exercise.instructions}
                  </p>
                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Play className="size-3" />
                      Watch video
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
