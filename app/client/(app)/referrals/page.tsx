import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyReferralLink } from "@/components/referrals/copy-referral-link";
import {
  getOrCreateReferralCode,
  getReferralStats,
} from "@/server/services/referral.service";
import { Gift, Users, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const session = await requireRole([Role.CLIENT]);
  const [codeResult, stats] = await Promise.all([
    getOrCreateReferralCode(session.user.id),
    getReferralStats(session.user.id),
  ]);

  const referralLink = codeResult.referralLink ?? "";

  return (
    <DashboardLayout
      title="Referrals"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Refer friends</h2>
          <p className="mt-1 text-muted-foreground">
            Share your personal link. When someone joins with it, they support
            your journey — and we keep track of it here.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="size-4 text-primary" />
              Your referral link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {codeResult.success && referralLink ? (
              <>
                <CopyReferralLink link={referralLink} />
                <p className="text-sm text-muted-foreground">
                  Code: <span className="font-mono font-medium">{codeResult.referralCode}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {codeResult.error ?? "Could not load your referral link right now."}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                  <p className="text-xs text-muted-foreground">Friends joined</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle2 className="size-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedReferrals}</p>
                  <p className="text-xs text-muted-foreground">First purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/10 p-2">
                  <Clock className="size-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
                  <p className="text-xs text-muted-foreground">Exploring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Share your personal link with friends who want structured programs.</li>
              <li>They create a free account through your link — no payment required to join.</li>
              <li>Their first program purchase is tracked here as a completed referral.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
