import { Role, MediaType } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { getClientMedia } from "@/server/services/media.service";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ClientMediaGrid } from "@/components/client-media-grid";
import { Card, CardContent } from "@/components/ui/card";
import { ClientMediaFilters } from "./client-media-filters";

type SearchParams = Promise<{
  type?: string;
  search?: string;
  page?: string;
}>;

export default async function ClientMediaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireRole([Role.CLIENT]);
  const params = await searchParams;

  const mediaData = await getClientMedia(session.user.id, {
    type: params.type as MediaType | undefined,
    search: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 20,
  });

  return (
    <DashboardLayout
      title="Media"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="mt-1 text-muted-foreground">
            Workout videos, exercise demos, and training images from your coach.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <ClientMediaFilters />
          </CardContent>
        </Card>

        <ClientMediaGrid media={mediaData.media} />

        {mediaData.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from(
              { length: mediaData.pagination.totalPages },
              (_, i) => i + 1,
            ).map((page) => (
              <a
                key={page}
                href={`/client/media?page=${page}${params.type ? `&type=${params.type}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  page === mediaData.pagination.page
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {page}
              </a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
