import { getDashboardMetrics, type DateRangeKey } from "@/lib/dashboard-metrics";
import { DateRangeSelect } from "@/components/dashboard/DateRangeSelect";
import { KpiCard } from "@/components/dashboard/KpiCard";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: DateRangeKey = rawRange === "30d" || rawRange === "all" ? rawRange : "7d";

  const metrics = await getDashboardMetrics(range);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading">Bonjour, Administrateur 👋</h1>
          <p className="mt-1 text-text-body">Gérez produits, commandes, clients et performance en un seul endroit.</p>
        </div>
        <DateRangeSelect />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          id="kpi-total-sales"
          title="Ventes Totales"
          value={String(metrics.kpis.totalSales.value)}
          trendPercent={metrics.kpis.totalSales.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KpiCard
          id="kpi-revenue"
          title="Chiffre d'Affaires"
          value={formatEUR(metrics.kpis.revenue.value)}
          trendPercent={metrics.kpis.revenue.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8V6m0 10v2" /></svg>}
        />
        <KpiCard
          id="kpi-active-clients"
          title="Clients Actifs"
          value={String(metrics.kpis.activeClients.value)}
          trendPercent={metrics.kpis.activeClients.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 100-8 4 4 0 000 8z" /></svg>}
        />
        <KpiCard
          id="kpi-refund-requests"
          title="Demandes de Remboursement"
          value={String(metrics.kpis.refundRequests.value)}
          trendPercent={metrics.kpis.refundRequests.trendPercent}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
        />
      </div>
    </main>
  );
}
