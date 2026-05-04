import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPostingAnalytics, getJobPerformanceTable } from "@/lib/services/employerService";
import GlobalAnalytics from "@/components/employer/GlobalAnalytics";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Analytics — UpnAbove Employer",
  description: "Track your hiring performance across all postings.",
};

export default async function EmployerAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [analyticsResult, performanceResult] = await Promise.all([
    getPostingAnalytics(user.id, 30),
    getJobPerformanceTable(user.id),
  ]);

  return (
    <GlobalAnalytics
      analytics={analyticsResult.data}
      jobPerformance={performanceResult.data || []}
    />
  );
}
