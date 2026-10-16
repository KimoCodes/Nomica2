import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { SavedProductsClient } from "@/components/favorites/saved-products-client";

export default async function SavedPage() {
  const session = await requireRole([Role.CLIENT]);

  return (
    <DashboardLayout
      title="Saved"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Saved programs</h2>
          <p className="mt-1 text-muted-foreground">
            Programs and bundles you bookmarked to consider later.
          </p>
        </div>
        <SavedProductsClient />
      </div>
    </DashboardLayout>
  );
}
