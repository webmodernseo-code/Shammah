import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardStatsGrid from "@/components/dashboard/dashboard-stats-grid";
import PeriodSalesBarChart from "@/components/dashboard/period-sales-bar-chart";
import OrdersDistributionDonut from "@/components/dashboard/orders-distribution-donut";
import RecentOrdersTable from "@/components/dashboard/recent-order-table";
import PaymentGatewaysStatusWidget from "@/components/dashboard/payment-gateways-status-widget";
import TopSellingProductsWidget from "@/components/dashboard/top-selling-products-widget";
import AbandonedCartSummaryWidget from "@/components/dashboard/abandoned-cart-summary-widget";

export const metadata: Metadata = {
  title: "Tableau de bord | DivinExpress Admin",
  description: "Pilotage et gestion de la boutique en ligne DivinExpress.",
};

export default function Home() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Vue d’ensemble
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Les indicateurs ci-dessous proviennent exclusivement des données enregistrées.
          </p>
        </div>

        <Link
          href="/products/add"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#22564e] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="size-4" />
          <span>Ajouter un produit</span>
        </Link>
      </div>

      <DashboardStatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <PeriodSalesBarChart />
        </div>
        <div className="lg:col-span-4">
          <OrdersDistributionDonut />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-4">
          <PaymentGatewaysStatusWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <TopSellingProductsWidget />
        <AbandonedCartSummaryWidget />
      </div>
    </div>
  );
}
