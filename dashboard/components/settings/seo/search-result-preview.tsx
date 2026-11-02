"use client";

import React, { useState } from "react";
import Switch from "@/components/ui/switch";

export default function SearchResultPreview() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
      <h3 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
        Search Result Preview
      </h3>
      <div className="bg-gray-100 rounded-xl p-4 flex items-start justify-between">
        <div className="flex-1 pr-6">
          <h4 className="font-semibold text-light-primary-text text-base mb-1">
            Enable Twitter Cards
          </h4>
          <p className="text-sm text-light-secondary-text leading-relaxed">
            Delivery usually takes 2–5 business days, depending on your location
            and the selected shipping method.
          </p>
        </div>
        <Switch checked={enabled} onChange={setEnabled} />
      </div>
    </div>
  );
}
