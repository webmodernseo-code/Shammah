"use client";

import React from "react";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";

export default function HomePageSeo() {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
      <h3 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
        Homepage SEO
      </h3>
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FloatingInput label="Homepage Title" />
          <FloatingInput label="Keywords" />
        </div>
        <FloatingTextarea
          label="Homepage Description"
          className="h-32 resize-none"
        />
      </div>
    </div>
  );
}
