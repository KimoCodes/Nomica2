import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { COACH_NAV } from "@/constants/navigation";
import { getCoachMedia, getMediaStats } from "@/server/services/media.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { MediaGrid } from "./media-grid";
import { MediaUploadButton } from "./media-upload-button";
import { MediaStats } from "./media-stats";
import { MediaFilters } from "./media-filters";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type SearchParams = Promise<{
  type?: string;
  tag?: string;
  search?: string;
  page?: string;
}>;

export default async function CoachMediaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole([Role.COACH]);
  const params = await searchParams;

  const [mediaData, stats] = await Promise.all([
    getCoachMedia(session.user.id, {
      type: params.type as "WORKOUT_VIDEO" | "EXERCISE_DEMO" | "TRAINING_IMAGE" | "TRANSFORMATION" | "PROGRESS_PHOTO" | "PROGRESS_VIDEO" | "HERO_REEL" | "PRODUCT_IMAGE" | "QUIZ_MEDIA" | undefined,
      tag: params.tag,
      search: params.search,
      page: params.page ? parseInt(params.page, 10) : 1,
      limit: 20,
    }),
    getMediaStats(session.user.id),
  ]);

  return (
    <DashboardLayout
      title="Media Library"
      navItems={[...COACH_NAV]}
      userName={session.user.name}
      userRole="Coach"
    >
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
            <p className="mt-1 text-muted-foreground">
              Upload and manage workout videos, exercise demos, and training images.
            </p>
          </div>
          <MediaUploadButton />
        </div>

        <MediaStats stats={stats} />

        <Card className="animate-slide-up stagger-3">
          <CardContent className="p-6">
            <MediaFilters />
          </CardContent>
        </Card>

        <div className="animate-slide-up stagger-4">
          <MediaGrid media={mediaData.media} />
        </div>

        {mediaData.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: mediaData.pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <a
                  key={page}
                  href={`/coach/media?page=${page}${params.type ? `&type=${params.type}` : ""}${params.tag ? `&tag=${params.tag}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    page === mediaData.pagination.page
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {page}
                </a>
              ),
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
