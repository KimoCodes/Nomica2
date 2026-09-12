import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ADMIN_NAV } from "@/constants/navigation";
import PageContentEditorClient from "@/components/admin/content/page-content-editor-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALID_SLUGS = [
  "home",
  "pricing",
  "club",
  "bundles",
  "programs",
  "transformations",
  "free-guide",
  "coming-soon",
];

export default async function PageContentEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireRole([Role.ADMIN]);
  const { slug } = await params;

  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  return (
    <DashboardLayout
      title={`Edit: ${slug.charAt(0).toUpperCase() + slug.slice(1)}`}
      navItems={[...ADMIN_NAV]}
      userName={session.user.name || "Admin"}
      userRole="Admin"
    >
      <div className="space-y-6">
        <Link href="/admin/content/pages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            Back to Pages
          </Button>
        </Link>
        <PageContentEditorClient pageSlug={slug} />
      </div>
    </DashboardLayout>
  );
}
