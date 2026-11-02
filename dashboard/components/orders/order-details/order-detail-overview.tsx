import { Badge } from "@/components/ui/badge";

export default function OrderDetailOverview() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">
          #73423
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant="success-outline">paid</Badge>
          <Badge variant="success">Delivered</Badge>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            label: "Order Date",
            value: "12 Sept, 2027",
            className: "bg-accent-1/60",
          },
          {
            label: "Total Items",
            value: "100 pcs",
            className: "bg-accent-4/60",
          },
          {
            label: "Delivery Date",
            value: "12 Sept, 2027",
            className: "bg-accent-7/60",
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`rounded-2xl p-4 sm:p-6 ${card.className}`}
          >
            <p className="text-xs font-semibold text-light-secondary-text mb-2">
              {card.label}
            </p>
            <p className="text-lg font-bold text-light-primary-text">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
