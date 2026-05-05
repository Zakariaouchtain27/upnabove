import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPostingAnalytics, getJobPerformanceTable } from "@/lib/services/employerService";
import GlobalAnalytics from "@/components/employer/GlobalAnalytics";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Analytics — UpnAbove Employer",
  description: "Track your hiring performance across all postings.",
};

export default async function EmployerAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ days?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const params = await searchParams;
  const days = parseInt(params?.days ?? '30', 10);
  const validDays = [14, 30, 90].includes(days) ? days : 30;

  const [analyticsResult, performanceResult] = await Promise.all([
    getPostingAnalytics(user.id, validDays),
    getJobPerformanceTable(user.id),
  ]);

  return (
    <GlobalAnalytics
      analytics={analyticsResult.data}
      jobPerformance={performanceResult.data || []}
      activeDays={validDays}
    />
  );
}
