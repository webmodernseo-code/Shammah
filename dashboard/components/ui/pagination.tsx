import React from "react";
import { ChevronLeft, ChevronRight } from "../../icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages.map((page, index) => {
      if (page === "...") {
        return (
          <span key={`ellipsis-${index}`} className="text-gray-400">
            ...
          </span>
        );
      }

      const isCurrentPage = page === currentPage;

      return (
        <button
          key={page}
          onClick={() => onPageChange(page as number)}
          className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs sm:text-sm transition-all ${
            isCurrentPage
              ? "bg-primary text-white font-bold shadow-2xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="size-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 shadow-2xs transition-colors"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex items-center gap-1">{renderPageNumbers()}</div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="size-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 shadow-2xs transition-colors"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
};
