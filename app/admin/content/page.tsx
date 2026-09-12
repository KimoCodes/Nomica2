import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Image,
  Palette,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

const PAGE_SECTIONS = [
  { slug: "home", label: "Homepage", description: "Hero, sections, CTAs" },
  { slug: "pricing", label: "Pricing", description: "Pricing cards, FAQs" },
  { slug: "club", label: "Sculpt Club", description: "Membership page" },
  { slug: "bundles", label: "Bundles", description: "Bundle listings" },
  { slug: "programs", label: "Programs", description: "Program listings" },
  { slug: "transformations", label: "Transformations", description: "Results page" },
  { slug: "free-guide", label: "Free Guide", description: "Lead magnet" },
  { slug: "coming-soon", label: "Coming Soon", description: "Launch page" },
] as const;

export default async function AdminContentDashboard() {
  const session = await requireRole([Role.ADMIN]);

  const [mediaStats, contentCount, themeCount, brandAssetCount] =
    await Promise.all([
      prisma.websiteMedia.aggregate({
        _count: true,
        where: { status: "PUBLISHED" },
      }),
      prisma.pageContent.count({ where: { status: "PUBLISHED" } }),
      prisma.siteTheme.count(),
      prisma.brandAsset.count(),
    ]);

  const recentMedia = await prisma.websiteMedia.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  const stats = [
    {
      label: "Published Media",
      value: mediaStats._count,
      icon: Image,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Page Sections",
      value: contentCount,
      icon: FileText,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Themes",
      value: themeCount,
      icon: Palette,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Brand Assets",
      value: brandAssetCount,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <DashboardLayout
      title="Content Management"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Website Content
          </h2>
          <p className="mt-1 text-muted-foreground">
            Manage website media, page content, themes, and branding without
            editing code.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card
              key={stat.label}
              className={`animate-slide-up stagger-${i + 1} card-hover-glow transition-all duration-200 hover:-translate-y-0.5`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`rounded-xl ${stat.bg} p-2.5 icon-hover`}
                  >
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/admin/content/media"
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Image className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Media Library</p>
                    <p className="text-xs text-muted-foreground">
                      Upload & manage website media
                    </p>
                  </div>
                </Link>
                <Link
                  href="/admin/content/pages"
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <FileText className="size-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Page Content</p>
                    <p className="text-xs text-muted-foreground">
                      Edit page text and sections
                    </p>
                  </div>
                </Link>
                <Link
                  href="/admin/content/theme"
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <Palette className="size-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Colors, fonts, light/dark mode
                    </p>
                  </div>
                </Link>
                <Link
                  href="/admin/content/branding"
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <Star className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Branding</p>
                    <p className="text-xs text-muted-foreground">
                      Logos, favicon, brand assets
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Media</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                  <Image className="mb-3 size-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium">No media yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload your first website media
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMedia.map((media) => (
                    <div
                      key={media.id}
                      className="flex items-center gap-3 rounded-lg border border-border/30 p-3"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {media.mimeType.startsWith("video/") ? (
                          <div className="flex size-full items-center justify-center">
                            <Clock className="size-4 text-muted-foreground" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.thumbnailUrl || media.url}
                            alt={media.altText || media.name}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {media.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {media.uploadedBy.name}
                        </p>
                      </div>
                      <Badge
                        variant={
                          media.status === "PUBLISHED"
                            ? "default"
                            : "secondary"
                        }
                        className="shrink-0"
                      >
                        {media.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editable Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PAGE_SECTIONS.map((page) => (
                <Link
                  key={page.slug}
                  href={`/admin/content/pages/${page.slug}`}
                  className="flex flex-col rounded-xl border border-border/50 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    <p className="text-sm font-medium">{page.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {page.description}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
