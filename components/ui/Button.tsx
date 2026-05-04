import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-violet-700 text-white shadow-lg shadow-violet-900/40 hover:bg-violet-600 hover:shadow-violet-700/50 hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600",
  ghost:
    "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70",
  outline:
    "border border-zinc-700 text-zinc-300 hover:border-violet-500/60 hover:text-violet-300 hover:bg-violet-500/8",
  destructive:
    "bg-red-600/90 text-white shadow-lg shadow-red-900/30 hover:bg-red-500 hover:shadow-red-800/50",
  danger:
    "bg-red-600/90 text-white shadow-lg shadow-red-900/30 hover:bg-red-500 hover:shadow-red-800/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:   "h-8  px-3   text-xs  font-medium rounded-lg  gap-1.5",
  md:   "h-9  px-4   text-sm  font-medium rounded-xl  gap-2",
  lg:   "h-11 px-6   text-sm  font-semibold rounded-xl gap-2",
  icon: "h-9  w-9    rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium tracking-tight
        transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        active:scale-[0.97]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
