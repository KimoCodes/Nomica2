"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Users, Gift, Clock } from "lucide-react";

type ReferralStats = {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  credits: number;
};

type ReferralData = {
  referralCode?: string;
  referralLink?: string;
  stats: ReferralStats;
};

export function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/client/referral");
        const result = await res.json();
        if (!cancelled) setData(result);
      } catch {
        // Failed to load
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const copyLink = async () => {
    if (data?.referralLink) {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share && data?.referralLink) {
      try {
        await navigator.share({
          title: "Join NomiTips",
          text: "Get a free month of premium fitness coaching!",
          url: data.referralLink,
        });
      } catch {
        // User cancelled
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Refer Friends
        </CardTitle>
        <CardDescription>
          Share NomiTips and earn free premium access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.referralLink && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your referral link</p>
            <div className="flex gap-2">
              <Input
                value={data.referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={share}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-lg font-semibold">{data.stats.totalReferrals}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Check className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold">{data.stats.completedReferrals}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">{data.stats.pendingReferrals}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Gift className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Credits</p>
              <p className="text-lg font-semibold">{data.stats.credits}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1">How it works</Badge>
            Share your link with friends. When they sign up and subscribe, you both get 1 free month of premium access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
