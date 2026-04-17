import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Globe,
  Briefcase,
  Share2,
  Bookmark,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Job Detail — UpnAbove",
  description: "View job details on UpnAbove.",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="p-6 rounded-2xl border border-border bg-background">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 dark:bg-primary-900/30">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Senior Frontend Engineer
                </h1>
                <p className="text-muted mt-1">TechCorp Global</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> San Francisco, CA
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Full-time
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> $140K – $180K
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="primary">React</Badge>
                  <Badge variant="primary">TypeScript</Badge>
                  <Badge variant="primary">Next.js</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
              <Button size="lg" className="flex-1 sm:flex-none">
                Apply Now
              </Button>
              <Button variant="outline" size="lg">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="lg">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl border border-border bg-background">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              About the Role
            </h2>
            <div className="prose prose-sm text-muted max-w-none space-y-4">
              <p>
                We are looking for a Senior Frontend Engineer to join our
                team and help build the next generation of our platform.
                You will work closely with designers and backend engineers
                to create intuitive, performant user experiences.
              </p>
              <h3 className="text-foreground font-semibold text-base">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>5+ years of experience with React and TypeScript</li>
                <li>Strong understanding of web performance optimization</li>
                <li>Experience with Next.js and server-side rendering</li>
                <li>Excellent communication and collaboration skills</li>
              </ul>
              <h3 className="text-foreground font-semibold text-base">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Competitive salary and equity package</li>
                <li>Remote-first culture with annual retreats</li>
                <li>Health, dental, and vision insurance</li>
                <li>Unlimited PTO and flexible hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-background">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Company Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted" />
                <span className="text-muted">TechCorp Global</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-muted" />
                <span className="text-muted">techcorp.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted" />
                <span className="text-muted">501–1,000 employees</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted" />
                <span className="text-muted">San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-background">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Job ID
            </h3>
            <p className="text-sm text-muted font-mono">{id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
