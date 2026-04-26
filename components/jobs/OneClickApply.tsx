"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface OneClickApplyProps {
  jobId: string;
  jobTitle: string;
}

export default function OneClickApply({ jobId, jobTitle }: OneClickApplyProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVerifying(false);
        return;
      }

      // Check if already applied
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', user.id)
        .single();

      if (existing) setApplied(true);

      // Check profile and resume
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id, resume_url')
        .eq('id', user.id)
        .single();

      if (candidate) {
        setHasProfile(true);
        if (candidate.resume_url) setHasResume(true);
      }
      
      setVerifying(false);
    }
    checkStatus();
  }, [jobId, supabase]);

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setApplied(true);
        addToast(`Successfully applied to ${jobTitle}!`, "success");
      } else {
        addToast(data.error || "Failed to apply", "error");
      }
    } catch (err) {
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing...
      </Button>
    );
  }

  if (applied) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 mr-2" /> Already Applied
      </Button>
    );
  }

  if (!hasResume) {
    return (
       <Link href="/dashboard/profile" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto" variant="outline">
             Complete Profile to Apply
          </Button>
       </Link>
    );
  }

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

// Separate Link component to avoid import issues
function Link({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  return <a href={href} className={className}>{children}</a>;
}
