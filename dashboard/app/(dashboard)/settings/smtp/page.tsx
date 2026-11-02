import React from "react";
import SmtpSettings from "@/components/settings/smtp/smtp-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serveur SMTP & E-mails",
  description: "Configuration du serveur SMTP pour l'envoi des factures et suivis de commandes.",
};

export default function SmtpSettingsPage() {
  return (
    <div className="space-y-6">
      <SmtpSettings />
    </div>
  );
}
