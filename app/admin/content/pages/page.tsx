import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  FileText,
  ChevronRight,
  Layout,
  Type,
  Image as ImageIcon,
} from "lucide-react";

const PAGE_SECTIONS = [
  { slug: "home", label: "Homepage", description: "Hero section, features, CTAs, FAQ" },
  { slug: "pricing", label: "Pricing", description: "Pricing cards, trust signals, FAQ" },
  { slug: "club", label: "Sculpt Club", description: "Membership hero, features, pricing" },
  { slug: "bundles", label: "Bundles", description: "Bundle listings, value props" },
  { slug: "programs", label: "Programs", description: "Program listings, hero section" },
  { slug: "transformations", label: "Transformations", description: "Results, testimonials" },
  { slug: "free-guide", label: "Free Guide", description: "Lead magnet, features" },
  { slug: "coming-soon", label: "Coming Soon", description: "Launch page, signup" },
] as const;

export default async function AdminPagesList() {
  const session = await requireRole([Role.ADMIN]);

  const pagesWithContent = await prisma.pageContent.groupBy({
    by: ["pageSlug"],
    _count: true,
    where: { status: "PUBLISHED" },
  });

  const contentMap = new Map(
    pagesWithContent.map((p) => [p.pageSlug, p._count]),
  );

  return (
    <DashboardLayout
      title="Page Content"
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editable Pages</h2>
          <p className="mt-1 text-muted-foreground">
            Select a page to edit its content, sections, and media.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAGE_SECTIONS.map((page) => {
            const count = contentMap.get(page.slug) || 0;
            return (
              <Link key={page.slug} href={`/admin/content/pages/${page.slug}`}>
                <Card className="card-hover-glow transition-all duration-200 hover:-translate-y-0.5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      {page.label}
                    </CardTitle>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {page.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={count > 0 ? "default" : "secondary"}>
                        {count} {count === 1 ? "section" : "sections"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
