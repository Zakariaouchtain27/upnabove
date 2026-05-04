"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Mail, Star, Zap, FileText, ShieldCheck } from "lucide-react";
import { FORGE_BADGES } from "@/components/forge/BadgeDefinitions";

const FILTERS = ["All", "Shortlisted", "Interviewing", "New"] as const;

interface Application {
  id: string;
  status: string | null;
  created_at: string;
  resume_url: string | null;
  forgeScore?: { finalScore: number; rank: number | null } | null;
  candidates: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
    forge_badges?: { badge_type: string }[];
  } | null;
  jobs?: { title: string } | null;
}

export default function CandidatePipeline({ applications }: { applications: Application[] }) {
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return applications.filter(app => {
      const cand = app.candidates;
      if (!cand) return false;
      const status = localStatuses[app.id] ?? app.status ?? 'pending';

      if (filter === "Shortlisted" && status !== "shortlisted") return false;
      if (filter === "Interviewing" && status !== "interviewing") return false;
      if (filter === "New" && status !== "pending") return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        return `${cand.first_name} ${cand.last_name}`.toLowerCase().includes(q) ||
          cand.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [applications, filter, query, localStatuses]);

  const updateStatus = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setLocalStatuses(prev => ({ ...prev, [appId]: status }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Candidate Pipeline</h1>
          <p className="mt-1 text-muted text-sm">All applicants with verified Forge performance data.</p>
        </div>
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email…" className="w-full max-w-md pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted" />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted">
          <p className="font-mono text-sm">No candidates match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const cand = app.candidates;
            if (!cand) return null;
            const status = localStatuses[app.id] ?? app.status ?? 'pending';
            const badges = cand.forge_badges || [];
            const isShortlisted = status === 'shortlisted';

            return (
              <div key={app.id} className="bg-background border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow flex flex-col xl:flex-row gap-5 items-start xl:items-center">

                {/* Avatar + name */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base shrink-0">
                    {cand.first_name?.[0]}{cand.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      {cand.first_name} {cand.last_name}
                      {badges.length > 0 && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Forge Verified
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{app.jobs?.title || 'Unknown role'} · Applied {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Forge score */}
                <div className="shrink-0">
                  {app.forgeScore ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-black text-amber-400">{app.forgeScore.finalScore}/100</span>
                      {app.forgeScore.rank && <span className="text-[9px] text-amber-400/70">#{app.forgeScore.rank}</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-muted font-mono px-3 py-1.5">No Forge score</span>
                  )}
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {badges.slice(0, 4).map(b => {
                      const def = FORGE_BADGES.find(bd => bd.id === b.badge_type);
                      if (!def) return null;
                      return (
                        <div key={b.badge_type} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${def.bg} ${def.border}`}>
                          <def.icon className={`w-3 h-3 ${def.color}`} />
                          <span className={`text-[10px] font-bold ${def.color}`}>{def.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status + actions */}
                <div className="flex items-center gap-2 xl:ml-auto shrink-0">
                  <select
                    value={status}
                    disabled={updatingId === app.id}
                    onChange={e => updateStatus(app.id, e.target.value)}
                    className="text-xs font-semibold border border-border rounded-lg px-3 py-2 bg-background text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button onClick={() => updateStatus(app.id, isShortlisted ? 'pending' : 'shortlisted')} className={`p-2 rounded-lg border transition-colors ${isShortlisted ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-border text-muted hover:text-amber-400 hover:border-amber-500/30'}`} title="Toggle Shortlist">
                    <Star className="w-4 h-4" fill={isShortlisted ? 'currentColor' : 'none'} />
                  </button>

                  <a href={`mailto:${cand.email}`} className="p-2 rounded-lg border border-border text-muted hover:text-primary hover:border-primary/30 transition-colors" title="Email candidate">
                    <Mail className="w-4 h-4" />
                  </a>

                  {app.resume_url && (
                    <Link href={`/employer/applications/${app.id}`} className="p-2 rounded-lg border border-border text-muted hover:text-primary hover:border-primary/30 transition-colors" title="View CV">
                      <FileText className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
