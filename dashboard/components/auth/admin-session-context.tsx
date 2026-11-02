"use client";

import { createContext, useContext } from "react";

export type AdminIdentity = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "MASTER_ADMIN";
};

const AdminSessionContext = createContext<AdminIdentity | null>(null);

export const AdminSessionProvider = AdminSessionContext.Provider;

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

export function isSuperAdminRole(role?: string) {
  return role === "SUPER_ADMIN" || role === "MASTER_ADMIN";
}
