export function KpiCard({
  id,
  title,
  value,
  trendPercent,
  icon,
}: {
  id: string;
  title: string;
  value: string;
  trendPercent: number | null;
  icon: React.ReactNode;
}) {
  const positive = (trendPercent ?? 0) >= 0;
  return (
    <div id={id} className="rounded-card bg-card-bg p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
          {icon}
        </span>
        <span className="text-sm text-text-body">{title}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span data-kpi-value className="text-2xl font-extrabold text-text-heading">{value}</span>
        {trendPercent !== null && (
          <span
            data-trend-badge
            className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (positive ? "bg-status-green/10 text-status-green" : "bg-status-red/10 text-status-red")}
          >
            {positive ? "+" : ""}{trendPercent.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
