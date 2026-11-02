"use client";

import { useState } from "react";
import Switch from "@/components/ui/switch";

export default function OpeningHours() {
  const [hours, setHours] = useState([
    { id: 1, start: "09:00 AM", end: "06:00 PM", active: true },
    { id: 2, start: "09:00 AM", end: "06:00 PM", active: true },
    { id: 3, start: "09:00 AM", end: "06:00 PM", active: true },
    { id: 4, start: "09:00 AM", end: "06:00 PM", active: true },
    { id: 5, start: "09:00 AM", end: "06:00 PM", active: true },
    { id: 6, start: "09:00 AM", end: "06:00 PM", active: true },
  ]);

  const toggle = (index: number) => {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, active: !h.active } : h)),
    );
  };

  const updateTime = (index: number, field: "start" | "end", value: string) => {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-500/20">
      <h3 className="text-lg font-bold text-light-primary-text mb-6">
        Operating Hours
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6">
        {hours.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-primary-alpha-16 gap-4 p-4"
          >
            <div className="flex order-2 items-center gap-6 text-base font-semibold text-light-primary-text">
              <span className="shrink-0">{item.start}</span>
              <span className="shrink-0">To</span>
              <span className="shrink-0">{item.end}</span>
            </div>
            <div className="order-1 sm:order-2 flex justify-end">
              <Switch
                checked={item.active}
                onChange={() => toggle(index)}
                className="ml-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
