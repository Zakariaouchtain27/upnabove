import type { Metadata } from "next";
import { Building2, ExternalLink, Inbox } from "lucide-react";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Application History — UpnAbove",
  description: "Track your job applications on UpnAbove.",
};

const statusVariant: Record<string, "primary" | "success" | "warning" | "danger" | "default"> = {
  Interview: "success",
  "Under Review": "warning",
  Applied: "primary",
  Rejected: "danger",
  Offered: "success",
};

export default function ApplicationsPage() {
  // No real applications table yet — show empty state
  const applications: any[] = [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Application History
        </h1>
        <p className="mt-1 text-muted">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-border border-dashed rounded-2xl bg-surface/50">
          <Inbox className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
          <p className="text-sm text-muted max-w-sm">Your job applications will appear here once you start applying to positions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-5 rounded-2xl border border-border bg-background
                hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center dark:bg-primary-900/30">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {app.title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {app.company} · Applied {app.appliedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[app.status] || "default"}>
                  {app.status}
                </Badge>
                <a
                  href={`/jobs/${app.id}`}
                  className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-alt transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
