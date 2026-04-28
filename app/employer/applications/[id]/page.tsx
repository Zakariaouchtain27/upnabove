"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Download, AlertCircle, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ApplicationViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadApplication() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        // Fetch application and joined job/candidate data
        const { data: application, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            jobs (
              title,
              employer_id
            ),
            candidates (
              first_name,
              last_name,
              email
            )
          `)
          .eq('id', appId)
          .single();

        if (appError || !application) {
          setError("Application not found.");
          setLoading(false);
          return;
        }

        // Verify ownership — fall back to user.id if no employers row exists
        const { data: employer } = await supabase
          .from('employers')
          .select('id')
          .eq('id', session.user.id)
          .single();

        const resolvedEmployerId = employer?.id ?? session.user.id;

        if (!application.jobs || resolvedEmployerId !== application.jobs.employer_id) {
          setError("You do not have permission to view this application.");
          setLoading(false);
          return;
        }

        if (mounted) {
          setAppData(application);
        }

        // Trigger the "viewed" logic and email notification silently
        if (!application.employer_viewed) {
          fetch(`/api/applications/${appId}/view`, { method: 'POST' }).catch(console.error);
        }

      } catch (err) {
        console.error("Error loading application:", err);
        if (mounted) setError("An unexpected error occurred.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadApplication();

    return () => { mounted = false; };
  }, [appId, router, supabase]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted">Loading candidate application...</p>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Access Error</h1>
        <p className="text-muted mt-2 max-w-md">{error}</p>
        <Link href="/employer" className="mt-6">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const candidateName = `${appData.candidates.first_name} ${appData.candidates.last_name}`;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header bar */}
      <div className="h-16 shrink-0 border-b border-border flex items-center justify-between px-6 bg-surface z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground text-sm sm:text-base">
              {candidateName}&apos;s Application
            </h1>
            <p className="text-xs text-muted">
              For: {appData.jobs.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={appData.resume_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </Button>
          </a>
          <a href={appData.resume_url} target="_blank" rel="noopener noreferrer" download>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </a>
        </div>
      </div>

      {/* PDF Viewer — use <object> for broader browser compatibility */}
      <div className="flex-1 w-full bg-background relative">
        <object
          data={`${appData.resume_url}#toolbar=1&view=FitH`}
          type="application/pdf"
          className="absolute inset-0 w-full h-full border-0"
          aria-label={`${candidateName} CV`}
        >
          {/* Fallback for browsers that block the embed */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-4">
            <p className="text-muted text-sm max-w-sm">
              Your browser is blocking the PDF preview. Use the buttons below to view the CV.
            </p>
            <div className="flex items-center gap-3">
              <a href={appData.resume_url} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
              </a>
              <a href={appData.resume_url} download>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </a>
            </div>
          </div>
        </object>
      </div>
    </div>
  );
}
