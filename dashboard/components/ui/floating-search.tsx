import React from "react";
import { SearchIcon } from "@/icons";
import { cn } from "@/lib/utils";

export interface FloatingSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const FloatingSearch = React.forwardRef<HTMLInputElement, FloatingSearchProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-light-secondary-text size-5 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          className={cn(
            "block w-full h-12 rounded-full border border-gray-500/20 bg-transparent pl-10 pr-4 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-0 placeholder:text-light-secondary-text",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
FloatingSearch.displayName = "FloatingSearch";

export { FloatingSearch };
