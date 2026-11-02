import React from "react";
import PaymentApiSettings from "@/components/settings/payment/payment-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passerelles de Paiement | DivinExpress Admin",
  description: "Configuration sécurisée des paiements bancaires Stripe et PayPal.",
};

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-6">
      <PaymentApiSettings />
    </div>
  );
}
