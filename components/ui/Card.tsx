import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className = "", hover = false, glow = false }: CardProps) {
  return (
    <div
      className={`
        relative rounded-xl overflow-hidden
        bg-zinc-900 border border-zinc-800
        ${hover ? "transition-all duration-250 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40" : ""}
        ${glow ? "hover:shadow-[0_0_30px_-8px_rgba(124,58,237,0.3)] hover:border-violet-800/40" : ""}
        ${className}
      `}
    >
      {/* Top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-zinc-800 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-t border-zinc-800 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
