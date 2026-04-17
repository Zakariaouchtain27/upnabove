import type { Metadata } from "next";
import { Plus, BarChart3, Users, Eye, Briefcase, Rocket } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Employer Dashboard — UpnAbove",
  description: "Manage your job postings and candidates on UpnAbove.",
};

const mockPostings = [
  {
    title: "Senior Frontend Engineer",
    applicants: 34,
    views: 420,
    status: "Active",
    posted: "Mar 10, 2026",
  },
  {
    title: "Product Designer",
    applicants: 18,
    views: 210,
    status: "Active",
    posted: "Mar 8, 2026",
  },
  {
    title: "DevOps Engineer",
    applicants: 12,
    views: 156,
    status: "Paused",
    posted: "Mar 5, 2026",
  },
];

export default function EmployerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Employer Dashboard
          </h1>
          <p className="mt-1 text-muted">
            Manage your job postings and candidates
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post a Job
        </Button>
      </div>

      {/* Payment & Subscription Hub */}
      <div className="mb-8 grid grid-cols-1 gap-4">
         <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <h3 className="font-bold text-emerald-500 flex items-center gap-2"><Rocket className="w-5 h-5" /> Your First Drop is on Us!</h3>
                <p className="text-sm text-muted mt-1">We're investing in your hiring speed. Your first standard Forge Challenge check-out is 100% free. Additionally, Deep Analytics are now unconditionally unlocked for all active listings at no cost.</p>
             </div>
             <Button className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">Deploy Now</Button>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Postings", value: "3", icon: <Briefcase className="w-5 h-5" /> },
          { label: "Total Applicants", value: "64", icon: <Users className="w-5 h-5" /> },
          { label: "Total Views", value: "786", icon: <Eye className="w-5 h-5" /> },
          { label: "Hire Rate", value: "23%", icon: <BarChart3 className="w-5 h-5" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl border border-border bg-background"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary flex items-center justify-center dark:bg-primary-900/30">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Postings table */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Your Job Postings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Position
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Applicants
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Views
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Posted
                </th>
              </tr>
            </thead>
            <tbody>
              {mockPostings.map((posting) => (
                <tr
                  key={posting.title}
                  className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-foreground">
                    {posting.title}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        posting.status === "Active" ? "success" : "warning"
                      }
                    >
                      {posting.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-muted">{posting.applicants}</td>
                  <td className="px-5 py-4 text-muted">{posting.views}</td>
                  <td className="px-5 py-4 text-muted">{posting.posted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
