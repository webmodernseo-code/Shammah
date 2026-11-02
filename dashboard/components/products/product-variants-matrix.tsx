"use client";

import React from "react";
import { ColorVariant, ProductVariantItem } from "@/lib/fashion-colors";
import { Layers, Sparkles, AlertCircle } from "lucide-react";

interface ProductVariantsMatrixProps {
  variants: ProductVariantItem[];
  onVariantsChange: (variants: ProductVariantItem[]) => void;
  basePrice: number;
}

export default function ProductVariantsMatrix({
  variants,
  onVariantsChange,
  basePrice,
}: ProductVariantsMatrixProps) {
  const handleStockChange = (index: number, newStock: number) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      stock: Math.max(0, newStock),
      inStock: newStock > 0,
    };
    onVariantsChange(updated);
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    const updated = [...variants];
    updated[index] = {
      ...updated[index],
      price: Math.max(0, newPrice),
    };
    onVariantsChange(updated);
  };

  const handleBatchStockApply = (amount: number) => {
    const updated = variants.map((v) => ({
      ...v,
      stock: amount,
      inStock: amount > 0,
    }));
    onVariantsChange(updated);
  };

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  if (variants.length === 0) {
    return (
      <div className="p-6 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl text-center">
        <AlertCircle className="size-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-gray-700">Aucune déclinaison générée pour le moment.</p>
        <p className="text-[11px] text-gray-400 mt-1">
          Sélectionnez au moins une taille et une couleur ci-dessus pour générer automatiquement la matrice de stock.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-indigo-600" />
          <span className="text-xs font-bold text-gray-900">
            Matrice des Déclinaisons ({variants.length} combinaisons • Stock global : {totalStock} pièces)
          </span>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 font-medium">Stock par défaut :</span>
          <button
            type="button"
            onClick={() => handleBatchStockApply(10)}
            className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            10 pcs
          </button>
          <button
            type="button"
            onClick={() => handleBatchStockApply(25)}
            className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            25 pcs
          </button>
          <button
            type="button"
            onClick={() => handleBatchStockApply(50)}
            className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            50 pcs
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Couleur</th>
              <th className="py-3 px-4">Taille</th>
              <th className="py-3 px-4">Référence Déclinaison (SKU)</th>
              <th className="py-3 px-4 w-32">Prix (€)</th>
              <th className="py-3 px-4 w-28">Stock</th>
              <th className="py-3 px-4 text-right">Disponibilité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {variants.map((v, index) => {
              const isLight =
                v.colorHex.toLowerCase() === "#ffffff" ||
                v.colorHex.toLowerCase() === "#f5f5f0" ||
                v.colorHex.toLowerCase() === "#e5e7eb";

              return (
                <tr key={`${v.color}-${v.size}`} className="hover:bg-gray-50/50 transition-colors">
                  {/* Color */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3.5 rounded-full border shadow-2xs shrink-0"
                        style={{
                          backgroundColor: v.colorHex,
                          borderColor: isLight ? "#D1D5DB" : "transparent",
                        }}
                      />
                      <span className="font-bold text-gray-900">{v.color}</span>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-xs">
                      {v.size}
                    </span>
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-gray-500">
                    {v.sku}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || basePrice)}
                        className="w-24 h-8 px-2 text-xs font-bold text-gray-900 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => handleStockChange(index, parseInt(e.target.value, 10) || 0)}
                      className={`w-20 h-8 px-2 text-xs font-bold rounded-lg border focus:outline-none ${
                        v.stock === 0
                          ? "border-red-300 bg-red-50 text-red-700"
                          : v.stock <= 5
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-white text-gray-900 focus:border-indigo-500"
                      }`}
                    />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    {v.stock === 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-semibold text-[11px]">
                        Rupture
                      </span>
                    ) : v.stock <= 5 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[11px]">
                        Stock faible ({v.stock})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                        En stock ({v.stock})
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
