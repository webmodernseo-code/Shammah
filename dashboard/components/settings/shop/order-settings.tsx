"use client";

import { useState } from "react";
import Switch from "@/components/ui/switch";
import { SettingsIcon } from "@/icons";

const notificationData = [
  { id: 1, title: "Cash on delivery", color: "bg-accent-1/60" },
  { id: 2, title: "Cash on delivery", color: "bg-accent-2/60" },
  { id: 3, title: "Cash on delivery", color: "bg-accent-3/60" },
  { id: 4, title: "Cash on delivery", color: "bg-accent-4/60" },
  { id: 5, title: "Cash on delivery", color: "bg-accent-5/60" },
  { id: 6, title: "Cash on delivery", color: "bg-accent-7/60" },
];

export default function OrderSettings() {
  const [notifications, setNotifications] = useState(
    notificationData.map((n) => ({ ...n, active: true })),
  );

  const toggle = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n)),
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-500/20">
      <h3 className="text-lg font-bold text-light-primary-text mb-6">
        Order Settings
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2  2xl:grid-cols-3 gap-6">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl relative p-4 ${item.color}`}
          >
            <div className="flex justify-between items-start gap-5 sm:gap-10">
              <div className="flex flex-col sm:flex-row gap-4 sm:pr-20">
                <div className="size-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <SettingsIcon className="size-6 text-light-primary-text" />
                </div>
                <div>
                  <h4 className="font-bold text-base mb-2 text-light-primary-text">
                    {item.title}
                  </h4>
                  <p className="text-sm text-light-secondary-text leading-5.5">
                    Delivery usually takes 2–5 business days, depending on your
                    location and the selected shipping method.
                  </p>
                </div>
              </div>
              <div className="absolute right-4 top-4">
                <Switch
                  checked={item.active}
                  onChange={() => toggle(item.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
