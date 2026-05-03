import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPostingAnalytics } from '@/lib/services/employerService';
import Providers from '@/components/Providers';
import AnalyticsOverview from '@/components/employer/AnalyticsOverview';
import SemanticSearch from '@/components/employer/SemanticSearch';
import CandidateGrid from '@/components/employer/CandidateGrid';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Command Center — JobForge',
  description: 'Employer Command Center with Semantic AI Candidate Search',
};

// Async Server Component
export default async function CommandCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch initial analytics data on the server
  const { data: analyticsData } = await getPostingAnalytics(user.id);

  return (
    <Providers>
      <div className="min-h-screen bg-[#05050a] text-white font-sans pt-8 pb-32 relative overflow-hidden">
        {/* Background Aesthetics */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="glow-orb-primary -top-40 -right-40 opacity-20" />
        <div className="glow-orb-emerald -bottom-40 -left-40 opacity-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                Command Center <ShieldAlert className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(255,111,97,0.4)]" />
              </h1>
              <p className="text-muted-foreground font-mono mt-3 text-sm tracking-wide">
                Intelligence Dashboard & Semantic Targeting
              </p>
            </div>
            
            <Suspense fallback={<div className="h-12 w-full max-w-md bg-white/5 rounded-2xl animate-pulse" />}>
              <SemanticSearch />
            </Suspense>
          </div>

          {/* Analytics Section */}
          <section>
            <AnalyticsOverview data={analyticsData} isLoading={false} />
          </section>

          {/* AI Search Grid Section */}
          <section className="pt-8 border-t border-white/5">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />
                ))}
              </div>
            }>
              <CandidateGrid />
            </Suspense>
          </section>
        </div>
      </div>
    </Providers>
  );
}
