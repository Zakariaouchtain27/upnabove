"use client";

import React from "react";
import { Code2, Palette, BarChart3, Megaphone, Database, Plus } from "lucide-react";

interface TemplateData {
  title: string;
  job_type: string;
  work_mode: string;
  description: string;
  requirements: string;
  benefits: string;
}

interface Template {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  data: TemplateData;
}

const TEMPLATES: Template[] = [
  {
    id: "software-engineer",
    label: "Software Engineer",
    description: "Full-stack or backend engineering role",
    icon: Code2,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    data: {
      title: "Senior Software Engineer",
      job_type: "full-time",
      work_mode: "hybrid",
      description: "We are looking for a Senior Software Engineer to join our growing engineering team. You will design, build, and maintain scalable systems that power our core product. You'll work closely with product and design to ship impactful features, participate in code reviews, and help define our technical roadmap.",
      requirements: "5+ years of software engineering experience\nStrong proficiency in TypeScript, React, or Node.js\nExperience with cloud infrastructure (AWS, GCP, or Azure)\nAbility to write clean, well-tested code\nExcellent communication skills",
      benefits: "Competitive salary + equity\nRemote-friendly culture\nUnlimited PTO\nHealth, dental, and vision coverage\nAnnual learning budget",
    },
  },
  {
    id: "product-designer",
    label: "Product Designer",
    description: "UI/UX and product design role",
    icon: Palette,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    data: {
      title: "Senior Product Designer",
      job_type: "full-time",
      work_mode: "remote",
      description: "We're hiring a Senior Product Designer to shape how millions of users experience our product. You'll lead end-to-end design from discovery and research through to polished, shipped UI. You'll collaborate with engineers, PMs, and stakeholders to create experiences that are both beautiful and highly usable.",
      requirements: "4+ years of product/UX design experience\nStrong portfolio demonstrating end-to-end product thinking\nProficiency in Figma\nExperience conducting user research and usability testing\nAbility to work cross-functionally with engineering",
      benefits: "Competitive salary\nFull remote setup stipend\nHealth and wellness benefits\nCreative freedom and ownership",
    },
  },
  {
    id: "product-manager",
    label: "Product Manager",
    description: "Product strategy and execution role",
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    data: {
      title: "Product Manager",
      job_type: "full-time",
      work_mode: "hybrid",
      description: "We are looking for a Product Manager to own a key area of our product. You will define the vision, prioritize the roadmap, and work with engineering and design to deliver outcomes for our customers. You'll be expected to deeply understand customer needs, market dynamics, and translate them into a clear product strategy.",
      requirements: "3+ years of product management experience\nStrong analytical and data-driven decision making\nExperience writing clear PRDs and roadmaps\nAbility to align cross-functional stakeholders\nExperience with B2B or SaaS products preferred",
      benefits: "Competitive salary + bonus\nStock options\nFlexible working hours\nLearning and development budget",
    },
  },
  {
    id: "marketing",
    label: "Marketing Lead",
    description: "Growth, content, and brand marketing",
    icon: Megaphone,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    data: {
      title: "Marketing Lead",
      job_type: "full-time",
      work_mode: "hybrid",
      description: "We're looking for a Marketing Lead to drive our growth and brand presence. You'll own end-to-end marketing strategy across content, paid, social, and partnerships. You'll work directly with the founding team to build our brand and acquire customers efficiently.",
      requirements: "4+ years of B2B or SaaS marketing experience\nProven track record of driving measurable growth\nStrong writing and storytelling skills\nExperience with growth loops, SEO, and paid channels\nData-driven mindset with strong analytical skills",
      benefits: "Competitive salary\nPerformance bonuses\nHealth benefits\nBudget to experiment and run campaigns",
    },
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    description: "Analytics, insights, and BI role",
    icon: Database,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    data: {
      title: "Data Analyst",
      job_type: "full-time",
      work_mode: "remote",
      description: "We're hiring a Data Analyst to help us make better decisions with data. You'll build dashboards, analyse product metrics, and partner with teams across the company to surface insights that drive strategy. You'll own our data infrastructure and ensure our leadership team has the information they need to move fast.",
      requirements: "3+ years of data analysis experience\nProficiency in SQL and Python (or R)\nExperience with BI tools (Metabase, Looker, or similar)\nStrong communication and data storytelling skills\nFamiliarity with dbt, Snowflake, or BigQuery preferred",
      benefits: "Competitive salary\nRemote-first culture\nUnlimited PTO\nAnnual data tools budget",
    },
  },
];

interface JobTemplatesProps {
  onSelect: (data: Partial<TemplateData>) => void;
  onSkip: () => void;
}

export default function JobTemplates({ onSelect, onSkip }: JobTemplatesProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.data)}
            className={`group text-left p-5 rounded-2xl border ${t.border} ${t.bg} hover:scale-[1.02] active:scale-[0.99] transition-all duration-200`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${t.bg} ${t.color} border ${t.border}`}>
              <t.icon className="w-5 h-5" />
            </div>
            <h3 className={`font-black text-base text-foreground mb-1`}>{t.label}</h3>
            <p className="text-sm text-muted">{t.description}</p>
            <div className={`mt-4 text-[10px] font-black uppercase tracking-widest ${t.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
              Use template →
            </div>
          </button>
        ))}

        {/* Scratch option */}
        <button
          onClick={onSkip}
          className="group text-left p-5 rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-border text-muted border border-border">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="font-black text-base text-foreground mb-1">Start from Scratch</h3>
          <p className="text-sm text-muted">Build your posting manually with full control.</p>
          <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Start blank →
          </div>
        </button>
      </div>
    </div>
  );
}
