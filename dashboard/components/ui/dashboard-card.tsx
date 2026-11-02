import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function DashboardCard({
  title,
  subtitle,
  action,
  className,
  headerClassName,
  contentClassName,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl w-full shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_20px_50px_-26px_rgba(15,23,42,0.35)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "px-4 sm:px-6 py-4 flex items-start justify-between",
          headerClassName,
        )}
      >
        <div>
          <h3 className="text-lg font-bold leading-7 text-light-primary-text">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-light-secondary-text mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("px-4 sm:px-6 pb-4 sm:pb-6", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
