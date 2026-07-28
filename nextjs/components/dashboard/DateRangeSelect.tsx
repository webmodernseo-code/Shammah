"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function DateRangeSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") || "7d";

  return (
    <select
      id="date-range-select"
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", e.target.value);
        router.push("/dashboard?" + params.toString());
      }}
      className="rounded-full border border-gray-200 bg-card-bg px-4 py-2 text-sm text-text-heading"
    >
      <option value="7d">7 derniers jours</option>
      <option value="30d">30 derniers jours</option>
      <option value="all">Tout</option>
    </select>
  );
}
