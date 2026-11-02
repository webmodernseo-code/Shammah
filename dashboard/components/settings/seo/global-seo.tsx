"use client";

import React from "react";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";

export default function GlobalPageSeo() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
      <h3 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
        Global SEO Settings
      </h3>
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FloatingInput label="Default Meta Title" />
          <FloatingInput label="Default Keywords" />
        </div>
        <FloatingTextarea
          label="Default Meta Description"
          className="h-32 resize-none"
        />
      </div>
    </div>
  );
}
