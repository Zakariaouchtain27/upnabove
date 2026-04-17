import type { Metadata } from "next";
import { Building2, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Application History — UpnAbove",
  description: "Track your job applications on UpnAbove.",
};

const mockApplications = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp Global",
    appliedDate: "Mar 14, 2026",
    status: "Interview",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignStudio",
    appliedDate: "Mar 12, 2026",
    status: "Under Review",
  },
  {
    id: "3",
    title: "Full-Stack Developer",
    company: "StartupXYZ",
    appliedDate: "Mar 10, 2026",
    status: "Applied",
  },
  {
    id: "4",
    title: "UX Researcher",
    company: "BigTech Inc.",
    appliedDate: "Mar 5, 2026",
    status: "Rejected",
  },
];

const statusVariant: Record<string, "primary" | "success" | "warning" | "danger" | "default"> = {
  Interview: "success",
  "Under Review": "warning",
  Applied: "primary",
  Rejected: "danger",
  Offered: "success",
};

export default function ApplicationsPage() {
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

      <div className="space-y-3">
        {mockApplications.map((app) => (
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
    </div>
  );
}
