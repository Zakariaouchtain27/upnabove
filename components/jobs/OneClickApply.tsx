"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link"; // <-- Use the official Next.js Link
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

interface OneClickApplyProps {
  jobId: string;
  jobTitle: string;
  hasApplied?: boolean;
}

export default function OneClickApply({ jobId, jobTitle, hasApplied = false }: OneClickApplyProps) {
  const { addToast } = useToast();
  const router = useRouter();
  
  // State Management
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  // User Status Flags
  const[isLoggedIn, setIsLoggedIn] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Instantiate client inside the effect or move it outside the component if it doesn't rely on props
    const supabase = createClient();

    async function checkStatus() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          setIsLoggedIn(false);
          setVerifying(false);
          return;
        }

        setIsLoggedIn(true);
        const user = session.user;

        // 1. Check if already applied
        const { data: existing, error: existingError } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('candidate_id', user.id)
          .maybeSingle();

        if (existingError) console.error("Error checking application:", existingError);
        if (existing && mounted) setApplied(true);

        // 2. Check profile and resume
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('id, resume_url')
          .eq('id', user.id)
          .maybeSingle();

        if (candidateError) console.error("Error fetching candidate:", candidateError);
        if (candidate?.resume_url && mounted) {
          setHasResume(true);
        }
        
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        if (mounted) setVerifying(false);
      }
    }
    
    checkStatus();
    
    return () => { mounted = false; };
  }, [jobId]); // Clean dependency array

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
    } catch (err) {
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading State
  if (verifying) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing...
      </Button>
    );
  }

  // 2. Not Logged In State (New!)
  if (!isLoggedIn) {
    return (
      <Link href="/login" className="w-full sm:w-auto block">
        <Button size="lg" className="w-full" variant="outline">
          Sign in to Apply
        </Button>
      </Link>
    );
  }

  // 3. Already Applied State
  if (applied) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 mr-2" /> Already Applied
      </Button>
    );
  }

  // 4. Missing Resume State
  if (!hasResume) {
    return (
       <Link href="/dashboard/cvs" className="w-full sm:w-auto block">
          <Button size="lg" className="w-full" variant="outline">
             Upload CV to Apply
          </Button>
       </Link>
    );
  }

  // 5. Ready to Apply State
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
