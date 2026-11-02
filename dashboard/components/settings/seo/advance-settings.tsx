"use client";

import React, { useState } from "react";
import Switch from "@/components/ui/switch";

export default function AdvanceSettings() {
  const [settings, setSettings] = useState([
    { id: 1, title: "Enable Twitter Cards", active: true },
    { id: 2, title: "Enable Twitter Cards", active: true },
    { id: 3, title: "Enable Twitter Cards", active: true },
    { id: 4, title: "Enable Twitter Cards", active: true },
    { id: 5, title: "Enable Twitter Cards", active: true },
    { id: 6, title: "Enable Twitter Cards", active: true },
  ]);

  const toggle = (id: number) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
  };

  return (
    <div className="bg-accent-2 rounded-2xl p-4 sm:p-6 border border-gray-500/20">
      <h3 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
        Advanced Settings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {settings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-light-primary-text text-sm">
                {item.title}
              </h4>
              <Switch checked={item.active} onChange={() => toggle(item.id)} />
            </div>
            <p className="text-sm text-light-secondary-text leading-5.5">
              Delivery usually takes 2–5 business days, depending on your
              location and the selected shipping method.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
