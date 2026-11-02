import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "rounded-xl inline-flex items-center justify-center cursor-pointer font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-100",
        "primary-outline":
          "border border-primary/30 bg-primary-lighter/40 text-primary hover:bg-primary-lighter",
        secondary:
          "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400",
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200",
        "danger-outline":
          "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/70",
        danger:
          "bg-error text-white hover:bg-error-dark disabled:bg-slate-200 disabled:text-slate-400",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none",
        icon: "text-slate-500 rounded-xl hover:bg-slate-100 hover:text-slate-900 border-none shadow-none bg-transparent",
        success:
          "bg-success text-white hover:bg-success-dark disabled:bg-slate-200 disabled:text-slate-400",
        "success-outline":
          "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70",
        warning:
          "bg-warning text-slate-900 hover:bg-warning-dark disabled:bg-slate-200 disabled:text-slate-400",
        "warning-outline":
          "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/70",
        info: "bg-info text-white hover:bg-info-dark disabled:bg-slate-200 disabled:text-slate-400",
        "info-outline":
          "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/70",
      },
      size: {
        xs: "px-3 py-1 h-7.5 text-xs",
        sm: "px-3.5 py-1.5 h-9 text-xs sm:text-sm",
        md: "px-4 py-2 h-10 text-sm",
        lg: "px-6 py-2.5 text-base",
        icon: "h-9 w-9 p-0 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  className,
  href,
  ...props
}) => {
  // If variant is "icon" and size is not specified, use "icon" size
  const effectiveSize = variant === "icon" && !size ? "icon" : size;

  const classes = cn(
    buttonVariants({ variant, size: effectiveSize }),
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export { buttonVariants };
