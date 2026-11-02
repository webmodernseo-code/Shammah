import React from "react";
import MaintenanceForm from "@/components/settings/maintainace/maintainance-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mode Maintenance | Shammah Admin",
  description: "Gestion et activation du mode maintenance sur la boutique Shammah.",
};

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <MaintenanceForm />
    </div>
  );
}
