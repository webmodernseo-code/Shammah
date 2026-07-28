"use client";

import type { DashboardMetrics, RecentOrder } from "@/lib/dashboard-metrics";

export function ExportReportButton({
  metrics,
  recentOrders,
}: {
  metrics: DashboardMetrics;
  recentOrders: RecentOrder[];
}) {
  function handleExport() {
    const lines = [
      "Indicateur,Valeur",
      "Ventes Totales," + metrics.kpis.totalSales.value,
      "Chiffre d'Affaires," + metrics.kpis.revenue.value.toFixed(2),
      "Clients Actifs," + metrics.kpis.activeClients.value,
      "Demandes de Remboursement," + metrics.kpis.refundRequests.value,
      "",
      "Commande,Client,Date,Montant,Statut",
      ...recentOrders.map((o) =>
        [o.orderNumber, o.clientName, o.createdAt.toLocaleDateString("fr-FR"), o.total.toFixed(2), o.status].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "rapport-shammah-" + today + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      id="export-report-btn"
      onClick={handleExport}
      className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-primary-hover"
    >
      Exporter le rapport
    </button>
  );
}
