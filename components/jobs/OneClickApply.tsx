"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface OneClickApplyProps {
  jobId: string;
  jobTitle: string;
  hasApplied?: boolean;
}

// Hard timeout helper — ensures Supabase queries never hang the UI
function timeout(ms: number) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
}

export default function OneClickApply({ jobId, jobTitle, hasApplied = false }: OneClickApplyProps) {
  const { addToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function checkStatus() {
      try {
        // Race entire init against a 6-second timeout so it never gets permanently stuck
        await Promise.race([
          (async () => {
            // Step 1: get session
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;

            if (!session?.user) {
              setIsLoggedIn(false);
              return;
            }

            setIsLoggedIn(true);
            const userId = session.user.id;

            // Step 2: check if already applied (non-fatal if it fails)
            try {
              const { data: existing } = await supabase
                .from("applications")
                .select("id")
                .eq("job_id", jobId)
                .eq("candidate_id", userId)
                .maybeSingle();
              if (existing && mounted) setApplied(true);
            } catch {
              // Silently ignored — we'll just not pre-fill the applied state
            }

            // Step 3: check if candidate has a CV (non-fatal if it fails)
            try {
              const { data: candidate } = await supabase
                .from("candidates")
                .select("resume_url")
                .eq("id", userId)
                .maybeSingle();
              if (candidate?.resume_url && mounted) setHasResume(true);
            } catch {
              // Silently ignored — "Upload CV to Apply" is the safe fallback
            }
          })(),
          timeout(6000),
        ]);
      } catch (e: any) {
        if (e?.message !== "timeout") {
          console.error("OneClickApply init error:", e);
        }
        // On timeout: isLoggedIn/applied/hasResume remain at their defaults
        // The button will render in a usable state rather than being stuck
      } finally {
        if (mounted) setVerifying(false);
      }
    }

    checkStatus();
    return () => { mounted = false; };
  }, [jobId]);

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

  // 1. Initializing
  if (verifying) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing...
      </Button>
    );
  }

  // 2. Not logged in
  if (!isLoggedIn) {
    return (
      <Link href="/login" className="w-full sm:w-auto block">
        <Button size="lg" className="w-full" variant="outline">
          Sign in to Apply
        </Button>
      </Link>
    );
  }

  // 3. Already applied
  if (applied) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 mr-2" /> Already Applied
      </Button>
    );
  }

  // 4. No resume
  if (!hasResume) {
    return (
      <Link href="/dashboard/cvs" className="w-full sm:w-auto block">
        <Button size="lg" className="w-full" variant="outline">
          Upload CV to Apply
        </Button>
      </Link>
    );
  }

  // 5. Ready to apply
  return (
    <Button
      size="lg"
      className="w-full sm:w-auto bg-[#FF6F61] text-white hover:bg-[#ff8c81] shadow-lg shadow-[#FF6F61]/30"
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
