"use client";

import React, { useState } from "react";
import { Search, Bot, User as UserIcon, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "./data";

interface InboxSidebarProps {
  className?: string;
  users: User[];
  activeUserId: string;
  onSelectUser: (user: User) => void;
  onClose?: () => void;
  activeTab: "all" | "customers" | "ai";
  setActiveTab: (tab: "all" | "customers" | "ai") => void;
}

export function InboxSidebar({
  className,
  users,
  activeUserId,
  onSelectUser,
  onClose,
  activeTab,
  setActiveTab,
}: InboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.orderNumber && user.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "ai") return user.category === "ai" && matchesSearch;
    if (activeTab === "customers") return user.category !== "ai" && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className={cn("flex flex-col h-full border-r border-gray-200 bg-white", className)}>
      {/* Sidebar Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Messagerie & Support Client
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Échanges clients & Conseillère Style IA DivinExpress
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
            {users.length} fil{users.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center",
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            Tous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={cn(
              "flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center",
              activeTab === "customers"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            Clients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1",
              activeTab === "ai"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-gray-500 hover:text-gray-800",
            )}
          >
            <Sparkles className="size-3" />
            <span>IA DivinExpress</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par client, email ou n°..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-gray-50 border border-gray-200 h-9.5 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Customer / Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            Aucune conversation trouvée.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = activeUserId === user.id;
            const isAi = user.category === "ai";

            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose?.();
                }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1",
                  isSelected
                    ? "bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 shadow-2xs"
                    : "hover:bg-gray-50 text-gray-700 bg-transparent",
                )}
              >
                {/* Avatar / Icon */}
                <div className="relative shrink-0">
                  {isAi ? (
                    <div className="size-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="size-5 text-amber-300" />
                    </div>
                  ) : (
                    <div className="size-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                      {user.initials}
                    </div>
                  )}
                  {user.isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                      {user.time}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1 leading-snug">
                    {user.lastMessage}
                  </p>

                  {user.orderNumber && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        #{user.orderNumber}
                      </span>
                      {user.orderStatus && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap",
                            user.orderStatus === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : user.orderStatus === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900",
                          )}
                        >
                          {user.orderStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
