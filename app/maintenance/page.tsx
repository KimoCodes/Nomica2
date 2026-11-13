import Image from "next/image";
import { StaffLoginLink } from "@/components/shared/staff-login-link";
import { getPublicAccessCopy } from "@/server/services/admin.service";

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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-white">
      <StaffLoginLink className="fixed right-4 top-4 z-20 border-white bg-white text-black shadow-lg hover:bg-slate-100 hover:text-black" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(96,165,250,0.16),_transparent_30%)]" />
      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        <div className="mb-10 aspect-[16/5] w-[240px] sm:w-[300px]">
          <Image
            src="/logo2.png"
            alt="NomiTips"
            fill
            sizes="(min-width: 640px) 300px, 240px"
            className="object-cover"
            style={{ objectPosition: "center 38%" }}
            priority
          />
        </div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          Maintenance Mode
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{headline}</h1>
        <p className="mt-4 text-base text-slate-300 sm:text-lg">{message}</p>
        <p className="mt-3 text-sm text-slate-400">Please check back shortly — we&apos;ll be back soon.</p>
      </div>
    </div>
  );
}
