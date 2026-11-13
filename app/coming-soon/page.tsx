import type { Metadata } from "next";
import { ComingSoonView } from "@/components/coming-soon/coming-soon-view";
import { getPublicAccessCopy } from "@/server/services/admin.service";

export const metadata: Metadata = {
  title: "NomiTips — Coming Soon",
  description: "NomiTips is launching soon. Join the early access list.",
};

// Admin-edited copy must be reflected without a redeploy, so this page is
// rendered on demand (the copy itself is cached in getPublicAccessCopy).
export const dynamic = "force-dynamic";

const FALLBACK_HEADLINE = "Be the First to Know";
const FALLBACK_MESSAGE =
  "We're crafting a premium fitness experience built for women who want real results. Launch is coming soon.";

export default async function ComingSoonPage() {
  const copy = await getPublicAccessCopy();

  return (
    <ComingSoonView
      headline={copy?.comingSoonHeadline || FALLBACK_HEADLINE}
      message={copy?.comingSoonMessage || FALLBACK_MESSAGE}
    />
  );
}
