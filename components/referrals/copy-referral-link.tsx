"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the link stays visible for manual copy.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 overflow-x-auto rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm">
        {link}
      </code>
      <Button onClick={copy} variant={copied ? "secondary" : "default"} className="shrink-0">
        {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
