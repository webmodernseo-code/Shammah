function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function SalesOverview({
  breakdown,
  topProducts,
}: {
  breakdown: { successfulPct: number; pendingPct: number; cancelledPct: number };
  topProducts: { title: string; amount: number; percentOfTotal: number }[];
}) {
  const legend = [
    { label: "Réussies", pct: breakdown.successfulPct, colorClass: "bg-status-green" },
    { label: "En attente", pct: breakdown.pendingPct, colorClass: "bg-status-amber" },
    { label: "Annulées", pct: breakdown.cancelledPct, colorClass: "bg-status-red" },
  ];

  const segments = 50;

  return (
    <div id="sales-overview" className="rounded-card bg-card-bg p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-heading">Aperçu des Ventes</h2>

      <div className="mt-4 flex gap-4 text-xs text-text-body">
        {legend.map((item) => (
          <span key={item.label} data-legend-item className="flex items-center gap-1.5">
            <span className={"h-2 w-2 rounded-full " + item.colorClass} />
            {item.label} ({item.pct.toFixed(0)}%)
          </span>
        ))}
      </div>

      <div className="mt-3 flex h-8 items-end gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const position = (i / segments) * 100;
          const colorClass =
            position < legend[0].pct
              ? legend[0].colorClass
              : position < legend[0].pct + legend[1].pct
              ? legend[1].colorClass
              : legend[2].colorClass;
          return <span key={i} className={"h-full w-1 rounded-sm " + colorClass} />;
        })}
      </div>

      <div id="sales-overview-top-products" className="mt-6">
        <h3 className="text-sm font-medium text-text-body">Produits les plus vendus</h3>
        <div className="mt-2 divide-y divide-gray-100">
          {topProducts.length === 0 && <p className="py-3 text-sm text-text-body">Aucune vente sur cette période.</p>}
          {topProducts.map((product) => (
            <div key={product.title} data-top-product-row className="flex items-center justify-between py-2">
              <span className="text-sm text-text-heading">{product.title}</span>
              <span className="text-xs text-text-body">{product.percentOfTotal.toFixed(0)}% · {formatEUR(product.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
