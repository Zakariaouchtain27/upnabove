"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Inbox, FileText, Mail, Search, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

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
}

interface ApplicationsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applications: any[];
}

export default function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return applications;
    const lower = query.toLowerCase();
    return applications.filter((app) => {
      const cand = app.candidates;
      if (!cand) return false;
      const inName = `${cand.first_name} ${cand.last_name}`.toLowerCase().includes(lower);
      const inEmail = cand.email?.toLowerCase().includes(lower);
      const inCv = cand.cv_text?.toLowerCase().includes(lower);
      return inName || inEmail || inCv;
    });
  }, [applications, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search CVs by keyword, skill, or name… e.g. "React", "Python", "Oxford"'
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
        {hasQuery && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {hasQuery && (
        <p className="text-sm text-muted mb-4">
          Found <span className="font-semibold text-foreground">{filtered.length}</span> of {applications.length} candidates matching &quot;<span className="text-primary">{query}</span>&quot;
        </p>
      )}

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              {hasQuery ? "No matching candidates" : "No applications yet"}
            </h3>
            <p className="text-sm text-muted max-w-sm">
              {hasQuery
                ? `No CVs contain "${query}". Try a different keyword.`
                : "Share your job posting to start receiving candidates."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Applied On</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">CV Search</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Contact</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const cand = app.candidates;
                  if (!cand) return null;

                  // Highlight the matched keyword in the CV snippet
                  let snippet: string | null = null;
                  if (hasQuery && cand.cv_text) {
                    const idx = cand.cv_text.toLowerCase().indexOf(query.toLowerCase());
                    if (idx !== -1) {
                      const start = Math.max(0, idx - 40);
                      const end = Math.min(cand.cv_text.length, idx + query.length + 40);
                      const before = cand.cv_text.slice(start, idx);
                      const match = cand.cv_text.slice(idx, idx + query.length);
                      const after = cand.cv_text.slice(idx + query.length, end);
                      snippet = `${start > 0 ? "…" : ""}${before}[[${match}]]${after}${end < cand.cv_text.length ? "…" : ""}`;
                    }
                  }

                  return (
                    <tr key={app.id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold dark:bg-primary-900/30">
                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cand.first_name} {cand.last_name}</p>
                            {app.employer_viewed && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 mt-0.5">Viewed</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <Badge variant="primary" className="capitalize">
                          {app.status || 'applied'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        {snippet ? (
                          <p className="text-xs text-muted leading-relaxed">
                            {snippet.split("[[").map((part, i) => {
                              if (i === 0) return <span key={i}>{part}</span>;
                              const [highlighted, rest] = part.split("]]");
                              return (
                                <span key={i}>
                                  <mark className="bg-primary/20 text-primary rounded px-0.5">{highlighted}</mark>
                                  {rest}
                                </span>
                              );
                            })}
                          </p>
                        ) : cand.cv_text ? (
                          <span className="text-xs text-muted/50 italic">CV indexed ✓</span>
                        ) : (
                          <span className="text-xs text-muted/40 italic">Not yet indexed</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <a href={`mailto:${cand.email}`} className="text-muted hover:text-primary transition-colors flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/employer/applications/${app.id}`}>
                          <Button variant={app.employer_viewed ? "outline" : "primary"} size="sm" className="gap-2">
                            <FileText className="w-4 h-4" />
                            View CV
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
    </div>
  );
}
