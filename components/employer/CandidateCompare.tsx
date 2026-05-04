"use client";

import React from "react";
import { X, FileText, Zap, Mail } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  resume_url: string | null;
  status: string | null;
  created_at: string;
  candidates: { id: string; first_name: string; last_name: string; email: string; cv_text?: string | null } | null;
  forgeScore?: { finalScore: number; rank: number | null } | null;
}

interface CandidateCompareProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
}

const STATUS_COLORS: Record<string, string> = {
  hired: 'bg-emerald-500/10 text-emerald-500',
  interviewing: 'bg-blue-500/10 text-blue-400',
  reviewing: 'bg-amber-500/10 text-amber-400',
  pending: 'bg-zinc-500/10 text-zinc-400',
  rejected: 'bg-rose-500/10 text-rose-400',
};

export default function CandidateCompare({ isOpen, onClose, applications }: CandidateCompareProps) {
  if (!isOpen || applications.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-background border border-border rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Candidate Comparison</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface transition-colors text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison grid */}
        <div className={`grid divide-x divide-border`} style={{ gridTemplateColumns: `repeat(${applications.length}, 1fr)` }}>
          {applications.map((app) => {
            const cand = app.candidates;
            if (!cand) return null;
            const statusCls = STATUS_COLORS[app.status || 'pending'] || STATUS_COLORS.pending;

            return (
              <div key={app.id} className="p-6 space-y-6">
                {/* Identity */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl mx-auto mb-3">
                    {cand.first_name?.[0]}{cand.last_name?.[0]}
                  </div>
                  <h3 className="font-black text-foreground text-lg">{cand.first_name} {cand.last_name}</h3>
                  <p className="text-xs text-muted mt-0.5">{cand.email}</p>
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${statusCls}`}>
                    {app.status || 'pending'}
                  </span>
                </div>

                {/* Forge Score */}
                <div className="p-4 rounded-2xl bg-surface border border-border text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Forge Score</p>
                  {app.forgeScore ? (
                    <div>
                      <div className="text-3xl font-black font-mono text-amber-400">{app.forgeScore.finalScore}</div>
                      <div className="text-[10px] text-muted mt-0.5">out of 100</div>
                      {app.forgeScore.rank && (
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs font-bold text-amber-400">
                          <Zap className="w-3 h-3" /> Rank #{app.forgeScore.rank}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted font-mono">No Forge history</p>
                  )}
                </div>

                {/* Applied date */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Applied</p>
                  <p className="text-sm text-foreground">{new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>

                {/* CV snippet */}
                {cand.cv_text && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">CV Excerpt</p>
                    <p className="text-xs text-muted leading-relaxed line-clamp-5">{cand.cv_text.slice(0, 300)}…</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {app.resume_url && (
                    <Link href={`/employer/applications/${app.id}`} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all">
                      <FileText className="w-3.5 h-3.5" /> View CV
                    </Link>
                  )}
                  <a href={`mailto:${cand.email}`} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-border text-muted hover:text-foreground hover:border-foreground transition-all">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
