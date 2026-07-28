function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function SuccessGauge({
  rate,
  successfulCount,
  revenue,
}: {
  rate: number;
  successfulCount: number;
  revenue: number;
}) {
  const segments = 12;
  const filledSegments = Math.round((rate / 100) * segments);

  return (
    <div id="success-gauge" className="rounded-card bg-card-bg p-6 shadow-card">
      <h2 className="text-base font-semibold text-text-heading">Taux de Réussite</h2>

      <svg width="100%" height="108" viewBox="0 0 180 100" style={{ marginTop: 6 }}>
        {Array.from({ length: segments }).map((_, i) => {
          const angle = (Math.PI * i) / (segments - 1);
          const x1 = 90 - 70 * Math.cos(angle);
          const y1 = 95 - 70 * Math.sin(angle);
          const x2 = 90 - 85 * Math.cos(angle);
          const y2 = 95 - 85 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i < filledSegments ? "var(--color-accent-primary)" : "#E5E7EB"}
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="-mt-8 text-center">
        <span data-gauge-rate className="text-2xl font-extrabold text-text-heading">{rate.toFixed(0)}%</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div id="success-gauge-sales-mini" className="rounded-lg bg-gray-50 p-3">
          <div className="text-xs text-text-body">Ventes</div>
          <div className="text-lg font-bold text-text-heading">{successfulCount}</div>
        </div>
        <div id="success-gauge-revenue-mini" className="rounded-lg bg-gray-50 p-3">
          <div className="text-xs text-text-body">Chiffre d&apos;Affaires</div>
          <div className="text-lg font-bold text-text-heading">{formatEUR(revenue)}</div>
        </div>
      </div>
    </div>
  );
}
