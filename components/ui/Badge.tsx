import React from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "outline" | "violet";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  "bg-zinc-800 text-zinc-300 border border-zinc-700",
  primary:  "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  violet:   "bg-violet-500/15 text-violet-300 border border-violet-500/25",
  success:  "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  warning:  "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  danger:   "bg-red-500/15 text-red-400 border border-red-500/25",
  outline:  "bg-transparent text-zinc-400 border border-zinc-700",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        rounded-md
        text-xs font-medium tracking-tight
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
