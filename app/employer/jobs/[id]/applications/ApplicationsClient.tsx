"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Inbox, FileText, Mail, Search, X, GitCompare, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CandidateCompare from "@/components/employer/CandidateCompare";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  cv_text?: string | null;
}

interface Application {
  id: string;
  resume_url: string | null;
  status: string | null;
  created_at: string;
  employer_viewed: boolean | null;
  candidates: Candidate | null;
  forgeScore?: { finalScore: number; rank: number | null } | null;
}

export default function ApplicationsClient({ applications }: { applications: Application[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return applications;
    const lower = query.toLowerCase();
    return applications.filter((app) => {
      const cand = app.candidates;
      if (!cand) return false;
      return (
        `${cand.first_name} ${cand.last_name}`.toLowerCase().includes(lower) ||
        cand.email?.toLowerCase().includes(lower) ||
        cand.cv_text?.toLowerCase().includes(lower)
      );
    });
  }, [applications, query]);

  const hasQuery = query.trim().length > 0;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else if (next.size < 3) { next.add(id); }
      return next;
    });
  };

  const selectedApps = applications.filter(a => selected.has(a.id));

  return (
    <div>
      {/* Search + compare bar */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by name, skill, or keyword… e.g. "React", "Python"'
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {hasQuery && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {selected.size >= 2 && (
          <Button onClick={() => setCompareOpen(true)} className="gap-2 shrink-0">
            <GitCompare className="w-4 h-4" /> Compare {selected.size}
          </Button>
        )}
      </div>

      {hasQuery && (
        <p className="text-sm text-muted mb-4">
          Found <span className="font-semibold text-foreground">{filtered.length}</span> of {applications.length} matching &quot;<span className="text-primary">{query}</span>&quot;
        </p>
      )}

      {selected.size > 0 && (
        <p className="text-xs text-muted mb-3 font-mono">{selected.size}/3 selected for comparison</p>
      )}

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              {hasQuery ? "No matching candidates" : "No applications yet"}
            </h3>
            <p className="text-sm text-muted max-w-sm">
              {hasQuery ? `No CVs match "${query}".` : "Share your job posting to start receiving candidates."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 w-10" />
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Applied</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Forge Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">CV Match</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Contact</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const cand = app.candidates;
                  if (!cand) return null;
                  const isSelected = selected.has(app.id);

                  let snippet: string | null = null;
                  if (hasQuery && cand.cv_text) {
                    const idx = cand.cv_text.toLowerCase().indexOf(query.toLowerCase());
                    if (idx !== -1) {
                      const start = Math.max(0, idx - 40);
                      const end = Math.min(cand.cv_text.length, idx + query.length + 40);
                      snippet = `${start > 0 ? "…" : ""}${cand.cv_text.slice(start, idx)}[[${cand.cv_text.slice(idx, idx + query.length)}]]${cand.cv_text.slice(idx + query.length, end)}${end < cand.cv_text.length ? "…" : ""}`;
                    }
                  }

                  return (
                    <tr key={app.id} className={`border-b border-border last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-alt'}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(app.id)}
                          disabled={!isSelected && selected.size >= 3}
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cand.first_name} {cand.last_name}</p>
                            {app.employer_viewed && (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 mt-0.5">Viewed</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted text-xs">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <Badge variant="primary" className="capitalize">{app.status || 'applied'}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        {app.forgeScore ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-black text-amber-400">{app.forgeScore.finalScore}/100</span>
                            {app.forgeScore.rank && <span className="text-[9px] text-amber-400/70">#{app.forgeScore.rank}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-muted/40 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        {snippet ? (
                          <p className="text-xs text-muted leading-relaxed">
                            {snippet.split("[[").map((part, i) => {
                              if (i === 0) return <span key={i}>{part}</span>;
                              const [hl, rest] = part.split("]]");
                              return <span key={i}><mark className="bg-primary/20 text-primary rounded px-0.5">{hl}</mark>{rest}</span>;
                            })}
                          </p>
                        ) : cand.cv_text ? (
                          <span className="text-xs text-muted/50 italic">CV indexed ✓</span>
                        ) : (
                          <span className="text-xs text-muted/40 italic">Not indexed</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <a href={`mailto:${cand.email}`} className="text-muted hover:text-primary transition-colors flex items-center gap-1.5 text-xs">
                          <Mail className="w-4 h-4" /> Email
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/employer/applications/${app.id}`}>
                          <Button variant={app.employer_viewed ? "outline" : "primary"} size="sm" className="gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> View CV
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CandidateCompare
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        applications={selectedApps}
      />
    </div>
  );
}
