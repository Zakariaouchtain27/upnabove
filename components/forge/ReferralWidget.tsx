"use client";

import React, { useState } from "react";
import { Copy, Check, Gift, Users, Twitter } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ReferralWidgetProps {
  referralUrl: string;
  referralCode: string;
  bonusVotes: number;
}

export function ReferralWidget({ referralUrl, referralCode, bonusVotes }: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      addToast("Referral link copied! Share it to earn +10 votes.", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast("Copy failed — please copy the URL manually.", "error");
    }
  };

  const handleTweet = () => {
    const text = encodeURIComponent(
      `Just joined The Forge — an elite anonymous dev challenge on @UpnAbove. Drop in using my link and we both level up 🚀 #TheForge #UpnAbove`
    );
    const url = encodeURIComponent(referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Gift className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-900 dark:text-white">Referral Link</h3>
            <p className="text-xs text-muted-foreground">Earn +10 votes per new entrant</p>
          </div>
        </div>
        {bonusVotes > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="text-emerald-500 font-bold text-sm">+{bonusVotes}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">banked votes</span>
          </div>
        )}
      </div>

      {/* Referral Code Display */}
      <div className="flex items-center gap-2">
        <div className="flex-1 font-mono text-sm px-4 py-3 bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border rounded-xl truncate text-foreground">
          {referralUrl}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            copied
              ? "bg-emerald-500 text-zinc-900 dark:text-white"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code + Share to Twitter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            Code: <span className="text-primary font-bold">{referralCode}</span>
          </span>
        </div>
        <button
          onClick={handleTweet}
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-zinc-900 dark:text-white rounded-xl font-bold text-xs transition-all"
        >
          <Twitter className="w-3.5 h-3.5" />
          Share on X
        </button>
      </div>

      {/* Explanation */}
      {bonusVotes === 0 && (
        <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border">
          When someone enters The Forge through your link for the first time, they get a fast-track and you bank{" "}
          <span className="text-primary font-semibold">+10 votes</span> — automatically applied to your next submission.
        </p>
      )}
      {bonusVotes > 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed pt-1 border-t border-emerald-500/20">
          🎉 You have <strong>{bonusVotes} bonus votes</strong> banked from referrals. They'll be automatically applied to your next Forge entry!
        </p>
      )}
    </div>
  );
}
