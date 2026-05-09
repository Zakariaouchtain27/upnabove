"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface OneClickApplyProps {
  jobId: string;
  jobTitle: string;
  /** Passed from the server — undefined means not logged in */
  userId?: string;
  hasApplied?: boolean;
  hasResume?: boolean;
}

export default function OneClickApply({
  jobId,
  jobTitle,
  userId,
  hasApplied = false,
  hasResume = false,
}: OneClickApplyProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setApplied(true);
        addToast(`Successfully applied to ${jobTitle}!`, "success");
        router.refresh();
      } else {
        addToast(data.error || "Failed to apply", "error");
      }
    } catch {
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Not logged in
  if (!userId) {
    return (
      <Link href={`/login?next=/jobs`} className="w-full sm:w-auto block">
        <Button size="lg" className="w-full" variant="outline">
          Sign in to Apply
        </Button>
      </Link>
    );
  }

  // Already applied
  if (applied) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 mr-2" /> Already Applied
      </Button>
    );
  }

  // No resume on file
  if (!hasResume) {
    return (
      <Link href="/dashboard/cvs" className="w-full sm:w-auto block">
        <Button size="lg" className="w-full" variant="outline">
          Upload CV to Apply
        </Button>
      </Link>
    );
  }

  // Ready to apply
  return (
    <Button
      size="lg"
      className="w-full sm:w-auto bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/40"
      onClick={handleApply}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Zap className="w-4 h-4 mr-2 fill-white" />
      )}
      {loading ? "Submitting..." : "One-Click Apply"}
    </Button>
  );
}
