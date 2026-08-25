"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { COACH_NAV } from "@/constants/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

type Transformation = {
  id: string;
  name: string;
  quote: string;
  story: string;
  beforeWeight: number | null;
  afterWeight: number | null;
  duration: string | null;
  programName: string | null;
  status: string;
  createdAt: string;
  beforePhoto: { url: string; thumbnailUrl: string | null } | null;
  afterPhoto: { url: string; thumbnailUrl: string | null } | null;
  clientProfile: {
    user: { name: string | null; email: string | null };
  };
};

export default function CoachTransformationsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coachNote, setCoachNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [userName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/coach/transformations");
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions);
        }
      } catch (err) {
        console.error("Failed to load submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const selected = submissions.find((s) => s.id === selectedId);

  async function handleReview(action: "approve" | "reject") {
    if (!selectedId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/coach/transformations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, coachNote: coachNote || undefined }),
      });

      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== selectedId));
        setSelectedId(null);
        setCoachNote("");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to review:", err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <DashboardLayout
      title="Transformations"
      navItems={[...COACH_NAV]}
      userName={userName}
      userRole="Coach"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Transformation Reviews
          </h2>
          <p className="mt-1 text-muted-foreground">
            Review and approve client transformation submissions.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-4 size-12 text-muted-foreground/30" />
              <p className="text-lg font-medium">No pending submissions</p>
              <p className="mt-1 text-sm text-muted-foreground">
                All transformation submissions have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : selected ? (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedId(null);
                setCoachNote("");
              }}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to list
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selected.clientProfile.user.name ?? "Client"}&apos;s
                  Transformation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                    {selected.beforePhoto ? (
                      <img
                        src={
                          selected.beforePhoto.thumbnailUrl ??
                          selected.beforePhoto.url
                        }
                        alt="Before"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No before photo
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                    {selected.afterPhoto ? (
                      <img
                        src={
                          selected.afterPhoto.thumbnailUrl ??
                          selected.afterPhoto.url
                        }
                        alt="After"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No after photo
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-full bg-primary/80 px-2 py-0.5 text-xs text-primary-foreground">
                      After
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.duration}
                    {selected.programName
                      ? ` · ${selected.programName}`
                      : ""}
                  </p>
                </div>

                <blockquote className="border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground">
                  &ldquo;{selected.quote}&rdquo;
                </blockquote>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm">{selected.story}</p>
                </div>

                {(selected.beforeWeight || selected.afterWeight) && (
                  <div className="flex gap-6 text-sm">
                    {selected.beforeWeight && (
                      <div>
                        <span className="text-muted-foreground">
                          Start weight:{" "}
                        </span>
                        <span className="font-medium">
                          {selected.beforeWeight} kg
                        </span>
                      </div>
                    )}
                    {selected.afterWeight && (
                      <div>
                        <span className="text-muted-foreground">
                          End weight:{" "}
                        </span>
                        <span className="font-medium">
                          {selected.afterWeight} kg
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="coach-note">
                    <MessageSquare className="mr-1 inline size-3" />
                    Coach Note (optional)
                  </Label>
                  <Textarea
                    id="coach-note"
                    value={coachNote}
                    onChange={(e) => setCoachNote(e.target.value)}
                    placeholder="Add a note for the client..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReview("approve")}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReview("reject")}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-premium"
                onClick={() => setSelectedId(submission.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex gap-1">
                      {submission.beforePhoto && (
                        <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={
                              submission.beforePhoto.thumbnailUrl ??
                              submission.beforePhoto.url
                            }
                            alt="Before"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 py-px text-[10px] text-white">
                            Before
                          </span>
                        </div>
                      )}
                      {submission.afterPhoto && (
                        <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={
                              submission.afterPhoto.thumbnailUrl ??
                              submission.afterPhoto.url
                            }
                            alt="After"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-0.5 left-0.5 rounded bg-primary/80 px-1 py-px text-[10px] text-primary-foreground">
                            After
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {submission.clientProfile.user.name ?? "Client"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {submission.quote}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
