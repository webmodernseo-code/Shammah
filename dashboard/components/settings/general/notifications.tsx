"use client";

import { useState } from "react";
import Switch from "@/components/ui/switch";
import { Bell, ShoppingBag, AlertTriangle, Star, BarChart3 } from "lucide-react";

const notificationChannels = [
  {
    id: 1,
    title: "Nouvelle Commande Payée",
    description: "Recevoir une alerte immédiate lors d'un nouveau paiement Stripe ou PayPal validé.",
    icon: ShoppingBag,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: 2,
    title: "Alerte de Stock Bas",
    description: "Notification automatique dès qu'un article de mode atteint son seuil de réapprovisionnement.",
    icon: AlertTriangle,
    iconColor: "text-amber-600 bg-amber-50",
  },
  {
    id: 3,
    title: "Nouvel Avis Client à Modérer",
    description: "Alerte pour relire et approuver un nouvel avis étoilé publié par un acheteur.",
    icon: Star,
    iconColor: "text-amber-500 bg-amber-50",
  },
  {
    id: 4,
    title: "Rapport Hebdomadaire des Ventes",
    description: "Synthèse détaillée du chiffre d'affaires et des pièces de mode les plus vendues chaque lundi.",
    icon: BarChart3,
    iconColor: "text-blue-600 bg-blue-50",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(
    notificationChannels.map((n) => ({ ...n, active: true })),
  );

  const toggle = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n)),
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
        <Bell className="size-5 text-emerald-600" />
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Alertes & Notifications Automatiques
          </h3>
          <p className="text-xs text-gray-500">
            Choisissez les événements boutique pour lesquels vous souhaitez recevoir une alerte email
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notifications.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200/80 p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="pt-0.5">
                <Switch
                  checked={item.active}
                  onChange={() => toggle(item.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
