import React from "react";
import Link from "next/link";
import { 
  Search, MapPin, Briefcase, DollarSign, Clock, 
  ChevronDown, Filter, Building2, Star, Zap
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SpotlightCard } from "@/components/SpotlightCard";

// Mock Data
const JOBS = [
  {
    id: 1,
    title: "Senior AI Engineer",
    company: "NeuralDynamics",
    location: "San Francisco, CA (Hybrid)",
    salary: "$180k - $250k",
    type: "Full-time",
    posted: "2h ago",
    tags: ["Machine Learning", "Python", "PyTorch"],
    logo: "N",
    featured: true,
  },
  {
    id: 2,
    title: "Principal Frontend Developer",
    company: "Stellar UI",
    location: "Remote",
    salary: "$150k - $200k + Equity",
    type: "Full-time",
    posted: "5h ago",
    tags: ["React", "TypeScript", "Next.js"],
    logo: "S",
    featured: true,
  },
  {
    id: 3,
    title: "Product Designer",
    company: "Lumina",
    location: "New York, NY",
    salary: "$130k - $170k",
    type: "Full-time",
    posted: "1d ago",
    tags: ["Figma", "UI/UX", "Design Systems"],
    logo: "L",
    featured: false,
  },
  {
    id: 4,
    title: "Backend Systems Architect",
    company: "Quantum Networks",
    location: "London, UK (Remote)",
    salary: "£120k - £160k",
    type: "Contract",
    posted: "1d ago",
    tags: ["Go", "Kubernetes", "Distributed Systems"],
    logo: "Q",
    featured: false,
  },
  {
    id: 5,
    title: "Staff Data Scientist",
    company: "DataFlow inc.",
    location: "Berlin, DE",
    salary: "€110k - €140k",
    type: "Full-time",
    posted: "2d ago",
    tags: ["SQL", "Analytics", "R"],
    logo: "D",
    featured: false,
  }
];

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background relative pt-24 px-6 sm:px-10 pb-32">
      {/* Background Effect */}
      <div className="glow-orb-primary fixed top-[-20%] right-[-10%] opacity-50 pointer-events-none" />

      <div className="layout-wrapper">
        <div className="section-container">
          
          <ScrollReveal delay={0.1}>
            {/* Header Section */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                Explore <span className="text-gradient-primary">Opportunities</span>
              </h1>
              <p className="text-lg text-muted max-w-2xl">
                Discover your next career-defining role from top-tier companies worldwide.
              </p>
            </div>
          </ScrollReveal>

          {/* Search and Filter Bar */}
          <ScrollReveal delay={0.2}>
            <div className="w-full glass-surface rounded-2xl p-4 mb-10 flex flex-col lg:flex-row gap-4 ring-1 ring-border">
              <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 flex items-center group">
                  <Search className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by role, company, or keyword..." 
                    className="w-full bg-surface text-foreground placeholder:text-muted pl-12 pr-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="relative flex-1 flex items-center group">
                  <MapPin className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="City, state, or remote" 
                    className="w-full bg-surface text-foreground placeholder:text-muted pl-12 pr-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-surface text-foreground font-medium hover:bg-surface-hover transition-colors shadow-sm">
                  <Filter className="w-4 h-4" /> Filters
                </button>
                <button className="px-8 py-3.5 bg-foreground text-background font-semibold rounded-xl hover:scale-105 transition-all shadow-sm">
                  Search
                </button>
              </div>
            </div>
          </ScrollReveal>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Filters */}
            <ScrollReveal delay={0.3} direction="right" className="hidden lg:block w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-between">
                  Job Type <ChevronDown className="w-4 h-4 text-muted" />
                </h3>
                <div className="space-y-3">
                  {["Full-time", "Part-time", "Contract", "Freelance", "Internship"].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded border border-border bg-surface group-hover:border-primary transition-colors flex items-center justify-center">
                        {type === "Full-time" && <div className="w-3 h-3 bg-primary rounded-sm" />}
                      </div>
                      <span className="text-muted group-hover:text-foreground transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-between">
                  Work Mode <ChevronDown className="w-4 h-4 text-muted" />
                </h3>
                <div className="space-y-3">
                  {["Remote", "Hybrid", "On-site"].map((mode) => (
                    <label key={mode} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded border border-border bg-surface group-hover:border-primary transition-colors flex items-center justify-center">
                        {mode === "Remote" && <div className="w-3 h-3 bg-primary rounded-sm" />}
                      </div>
                      <span className="text-muted group-hover:text-foreground transition-colors">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-between">
                  Salary Range <ChevronDown className="w-4 h-4 text-muted" />
                </h3>
                {/* Simplified range slider visual */}
                <div className="pt-2 pb-4">
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-primary w-[60%] ml-[20%]" />
                  </div>
                  <div className="flex justify-between mt-3 text-sm text-muted">
                    <span>$80k</span>
                    <span>$250k+</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Job Listings */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted font-medium">Showing <span className="text-foreground">1-5</span> of <span className="text-foreground">24,000+</span> jobs</p>
                <div className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground transition-colors">
                  Sort by: <span className="text-foreground font-medium">Most Relevant</span> <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {JOBS.map((job, i) => (
                  <ScrollReveal key={job.id} delay={0.2 + (i * 0.1)} direction="up">
                    <SpotlightCard className="w-full wireframe-card hover:bg-surface-hover transition-colors group">
                      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                        {/* Company Logo Placeholder */}
                        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-2xl font-bold text-foreground">{job.logo}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                  {job.title}
                                </h2>
                                {job.featured && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                                    <Zap className="w-3 h-3" /> Featured
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-muted">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium text-foreground">{job.company}</span>
                              </div>
                            </div>
                            
                            <button className="sm:hidden px-6 py-2 bg-foreground text-background font-medium rounded-xl hover:scale-105 transition-all w-full text-center">
                              Apply Now
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 mb-5 text-sm">
                            <div className="flex items-center gap-2 text-muted">
                              <MapPin className="w-4 h-4" /> {job.location}
                            </div>
                            <div className="flex items-center gap-2 text-muted">
                              <DollarSign className="w-4 h-4" /> {job.salary}
                            </div>
                            <div className="flex items-center gap-2 text-muted">
                              <Briefcase className="w-4 h-4" /> {job.type}
                            </div>
                            <div className="flex items-center gap-2 text-muted">
                              <Clock className="w-4 h-4" /> {job.posted}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                            <div className="flex items-center gap-2 flex-wrap">
                              {job.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-lg bg-surface border border-border text-xs font-medium text-muted">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="hidden sm:flex items-center gap-3">
                              <button className="p-3 rounded-xl border border-border hover:bg-surface text-muted hover:text-primary transition-all group-hover:border-primary/30">
                                <Star className="w-5 h-5" />
                              </button>
                              <button className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-xl hover:scale-105 transition-all shadow-sm">
                                Apply Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </ScrollReveal>
                ))}
              </div>
              
              <ScrollReveal delay={0.8} direction="up" className="mt-10 flex justify-center">
                <button className="px-6 py-3 rounded-xl border border-border bg-surface text-foreground font-medium hover:bg-surface-hover transition-colors shadow-sm">
                  Load More Jobs
                </button>
              </ScrollReveal>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
