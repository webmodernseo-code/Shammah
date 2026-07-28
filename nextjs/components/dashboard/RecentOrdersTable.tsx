import type { RecentOrder } from "@/lib/dashboard-metrics";

const STATUS_LABEL: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  EXPEDIEE: "Expédiée",
  ANNULEE: "Annulée",
};
const STATUS_CLASS: Record<string, string> = {
  EN_ATTENTE: "bg-status-amber/10 text-status-amber",
  PAYEE: "bg-status-blue/10 text-status-blue",
  EXPEDIEE: "bg-status-green/10 text-status-green",
  ANNULEE: "bg-status-red/10 text-status-red",
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <div id="recent-orders-table" className="rounded-card bg-card-bg p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-heading">Commandes Récentes</h2>
      <div className="mt-4 divide-y divide-gray-100">
        {orders.length === 0 && <p className="py-4 text-sm text-text-body">Aucune commande pour le moment.</p>}
        {orders.map((order) => (
          <div key={order.id} data-order-row className="flex items-center gap-3 py-3">
            {order.thumbnailUrl ? (
              <img src={order.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-text-body">
                {order.firstItemTitle.charAt(0)}
              </span>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-text-heading">
                {order.firstItemTitle}
                {order.extraItemsCount > 0 && <span className="text-text-body"> +{order.extraItemsCount} autres articles</span>}
              </div>
              <div className="text-xs text-text-body">{order.clientName} · {order.createdAt.toLocaleDateString("fr-FR")}</div>
            </div>
            <div className="text-sm font-semibold text-text-heading">{formatEUR(order.total)}</div>
            <span className={"rounded-full px-2 py-1 text-xs font-medium " + STATUS_CLASS[order.status]}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
