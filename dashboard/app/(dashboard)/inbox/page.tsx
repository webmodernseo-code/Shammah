"use client";

import React, { Fragment, useEffect, useState } from "react";
import { InboxSidebar } from "@/components/inbox/inbox-sidebar";
import { ChatWindow } from "@/components/inbox/conversation";
import { User, Message, INITIAL_AI_USER } from "@/components/inbox/data";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { RefreshCw, Sparkles, MessageSquare } from "lucide-react";

export default function InboxPage() {
  const [users, setUsers] = useState<User[]>([INITIAL_AI_USER]);
  const [selectedUser, setSelectedUser] = useState<User>(INITIAL_AI_USER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "customers" | "ai">("all");

  useEffect(() => {
    async function loadInbox() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/inbox", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setUsers(json.data);
            setSelectedUser(json.data[0]);
          }
        }
      } catch (err) {
        console.warn("Could not load inbox data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInbox();
  }, []);

  const handleUpdateUserMessages = (userId: string, newMsg: Message) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            lastMessage: newMsg.content,
            messages: [...u.messages, newMsg],
          };
        }
        return u;
      }),
    );
  };

  return (
    <div className="space-y-4">
      {/* Container Frame */}
      <div className="h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-3xl border border-gray-200 overflow-hidden flex shadow-2xs">
        {/* Desktop Sidebar */}
        <div className="w-80 lg:w-[350px] h-full shrink-0 hidden md:block">
          <InboxSidebar
            users={users}
            activeUserId={selectedUser.id}
            onSelectUser={setSelectedUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 h-full min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <RefreshCw className="size-6 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Chargement des messages clients...</p>
            </div>
          ) : (
            <ChatWindow
              selectedUser={selectedUser}
              onMobileMenuClick={() => setIsSidebarOpen(true)}
              onUpdateUserMessages={handleUpdateUserMessages}
            />
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <Transition appear show={isSidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 md:hidden"
          onClose={() => setIsSidebarOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative w-80 max-w-[calc(100%-3rem)] h-full bg-white shadow-2xl">
                <InboxSidebar
                  users={users}
                  activeUserId={selectedUser.id}
                  onSelectUser={setSelectedUser}
                  onClose={() => setIsSidebarOpen(false)}
                  className="border-none"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
