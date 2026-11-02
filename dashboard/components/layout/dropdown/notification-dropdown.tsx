"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { Bell, ShoppingBag, AlertTriangle, CreditCard } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  description: string;
  type: "order" | "stock" | "payment";
  href?: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.notifications) {
            setNotifications(json.data.notifications);
          }
        }
      } catch (err) {
        console.warn("Could not fetch real notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const displayedNotifications = isCleared ? [] : notifications;
  const count = displayedNotifications.length;

  const handleClearAll = () => {
    setIsCleared(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="size-4 text-emerald-600" />;
      case "stock":
        return <AlertTriangle className="size-4 text-amber-600" />;
      default:
        return <CreditCard className="size-4 text-blue-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "order":
        return "bg-emerald-50";
      case "stock":
        return "bg-amber-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="relative size-9 rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors focus:outline-none cursor-pointer text-gray-600 hover:text-gray-900 shadow-2xs">
          <Bell className="size-4.5 text-gray-600" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 border border-white" />
          )}
        </MenuButton>

        <MenuItems
          transition
          className="absolute -right-[70px] sm:right-0 mt-2 w-[320px] sm:w-[350px] origin-top-right rounded-2xl bg-white ring-1 ring-gray-200/90 shadow-lg focus:outline-none z-50 transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 p-1"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900">
                Notifications
              </h3>
              {count > 0 && (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>
            {count > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer"
              >
                Tout effacer
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] p-2 space-y-1.5 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Chargement des notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 space-y-1">
                <Bell className="size-6 text-gray-300 mx-auto" />
                <p className="font-medium text-gray-600">Aucune nouvelle notification</p>
                <p className="text-[11px] text-gray-400">Tout est à jour dans Shammah.</p>
              </div>
            ) : (
              displayedNotifications.map((notification) => {
                const content = (
                  <div className="flex gap-3 rounded-xl p-2.5 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                    <div className="shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl ${getBg(
                          notification.type
                        )} flex items-center justify-center`}
                      >
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                );

                return notification.href ? (
                  <Link key={notification.id} href={notification.href} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })
            )}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
