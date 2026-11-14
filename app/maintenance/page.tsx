import type { Metadata } from "next";
import { MaintenanceView } from "@/components/maintenance/maintenance-view";
import { getPublicAccessCopy } from "@/server/services/admin.service";

export const metadata: Metadata = {
  title: "Maintenance in Progress",
  description: "NomiTips is undergoing scheduled maintenance. We'll be back shortly.",
  robots: { index: false, follow: false },
};

const FALLBACK_HEADLINE = "We're making updates";
const FALLBACK_MESSAGE =
  "NomiTips is temporarily unavailable while we improve the platform, expand the training experience, and fine-tune the member journey.";

// Admin-edited copy must be reflected without a redeploy, so this page is
// rendered on demand (the copy itself is cached in getPublicAccessCopy).
export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const copy = await getPublicAccessCopy();
  const headline = copy?.maintenanceHeadline || FALLBACK_HEADLINE;
  const message = copy?.maintenanceMessage || FALLBACK_MESSAGE;
  const returnAt = copy?.maintenanceReturnAt ? copy.maintenanceReturnAt.toISOString() : null;

  return (
    <MaintenanceView headline={headline} message={message} returnAt={returnAt} />
  );
}
