import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layers } from "lucide-react";

interface VariantItem {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
  status: "En stock" | "Stock faible" | "Rupture";
}

const defaultVariants: VariantItem[] = [
  { sku: "DIV-H-101-NOIR-S", color: "Noir Intense", colorHex: "#111827", size: "S", stock: 15, price: 249.99, status: "En stock" },
  { sku: "DIV-H-101-NOIR-M", color: "Noir Intense", colorHex: "#111827", size: "M", stock: 22, price: 249.99, status: "En stock" },
  { sku: "DIV-H-101-NOIR-L", color: "Noir Intense", colorHex: "#111827", size: "L", stock: 18, price: 249.99, status: "En stock" },
  { sku: "DIV-H-101-NOIR-XL", color: "Noir Intense", colorHex: "#111827", size: "XL", stock: 8, price: 249.99, status: "En stock" },
  { sku: "DIV-H-101-MAR-S", color: "Bleu Marine", colorHex: "#1E3A8A", size: "S", stock: 12, price: 249.99, status: "En stock" },
  { sku: "DIV-H-101-MAR-M", color: "Bleu Marine", colorHex: "#1E3A8A", size: "M", stock: 14, price: 249.99, status: "En stock" },
  { sku: "DIV-H-101-MAR-L", color: "Bleu Marine", colorHex: "#1E3A8A", size: "L", stock: 4, price: 249.99, status: "Stock faible" },
  { sku: "DIV-H-101-BEI-M", color: "Beige Sable", colorHex: "#D4C4A8", size: "M", stock: 0, price: 249.99, status: "Rupture" },
];

export default function ProductVariantTable({ variants = defaultVariants }: { variants?: VariantItem[] }) {
  return (
    <div className="border rounded-2xl border-gray-200 bg-white shadow-xs overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-gray-900">Déclinaisons Couleurs & Tailles</h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">{variants.length} combinaisons configurées</span>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-200">
              <TableHead className="text-xs font-semibold text-gray-600">Référence Déclinaison</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Nuance / Couleur</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Taille</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Prix Unitaire</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Stock Disponible</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-right pr-6">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((item, index) => {
              const isLight =
                item.colorHex.toLowerCase() === "#ffffff" ||
                item.colorHex.toLowerCase() === "#f5f5f0" ||
                item.colorHex.toLowerCase() === "#e5e7eb";

              return (
                <tr
                  key={index}
                  className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition-colors text-xs"
                >
                  <td className="py-3 px-4 font-mono text-gray-500 font-medium">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3.5 rounded-full border shadow-2xs shrink-0"
                        style={{
                          backgroundColor: item.colorHex,
                          borderColor: isLight ? "#D1D5DB" : "transparent",
                        }}
                      />
                      <span className="font-bold text-gray-900">{item.color}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-xs">
                      {item.size}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-900">
                    {item.price.toFixed(2).replace(".", ",")} €
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-700">
                    {item.stock} pièces
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right pr-6">
                    <Badge
                      variant={
                        item.status === "En stock"
                          ? "success"
                          : item.status === "Stock faible"
                          ? "warning"
                          : "error"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
