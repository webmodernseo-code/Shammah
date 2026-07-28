"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export function StockInput({
  productId,
  variantId,
  size,
  initialQuantity,
}: {
  productId: string;
  variantId: string;
  size: string;
  initialQuantity: number;
}) {
  const [value, setValue] = useState(String(initialQuantity));
  const router = useRouter();
  const { show } = useToast();

  async function commit() {
    const parsed = Math.max(0, Math.trunc(Number(value)) || 0);
    setValue(String(parsed));

    const res = await fetch(`/api/products/${productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, size, quantity: parsed }),
    });

    if (res.ok) {
      show("Stock mis à jour.", "success");
      router.refresh();
    } else {
      show("Erreur lors de la mise à jour du stock.", "error");
    }
  }

  return (
    <input
      data-stock-input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs"
    />
  );
}
