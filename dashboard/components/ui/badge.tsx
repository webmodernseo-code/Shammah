import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default"
    | "primary"
    | "accent"
    | "neutral"
    | "success-outline"
    | "warning-outline"
    | "error-outline"
    | "info-outline"
    | "active";
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
  warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
  error: "bg-rose-50 text-rose-700 border border-rose-200/80",
  info: "bg-sky-50 text-sky-700 border border-sky-200/80",
  primary: "bg-primary-lighter text-primary border border-primary/20",
  accent: "bg-indigo-50 text-primary border border-indigo-200/80",
  neutral: "bg-slate-100 text-slate-700 border border-slate-200",
  default: "bg-slate-100 text-slate-700 border border-slate-200",
  "success-outline": "bg-transparent border border-emerald-500 text-emerald-700",
  "warning-outline": "bg-transparent border border-amber-500 text-amber-700",
  "error-outline": "bg-transparent border border-rose-500 text-rose-700",
  "info-outline": "bg-transparent border border-sky-500 text-sky-700",
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
}) => {
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 min-h-5.5 inline-flex items-center justify-center font-public-sans leading-none rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
        variantStyles[variant] || variantStyles.default,
        className,
      )}
    >
      {children}
    </span>
  );
};
