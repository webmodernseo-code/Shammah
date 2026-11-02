"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shirt, TrendingUp } from "lucide-react";

interface TopProduct {
  id: string;
  productName: string;
  category: string;
  price: string;
  totalSales: number;
  revenue: string;
  stock: number;
}

const DEFAULT_TOP_FASHION_PRODUCTS: TopProduct[] = [
  {
    id: "DIV-H-101",
    productName: "Costume 2 Pièces Laine Vierge",
    category: "Homme",
    price: "289,00 €",
    totalSales: 142,
    revenue: "41 038,00 €",
    stock: 45,
  },
  {
    id: "DIV-F-201",
    productName: "Robe Longue Fluide Soie Sauvage",
    category: "Femme",
    price: "195,00 €",
    totalSales: 118,
    revenue: "23 010,00 €",
    stock: 60,
  },
  {
    id: "DIV-U-301",
    productName: "Hoodie Oversize Signature Coton Bio",
    category: "Homme",
    price: "89,00 €",
    totalSales: 245,
    revenue: "21 805,00 €",
    stock: 120,
  },
  {
    id: "DIV-H-102",
    productName: "Chemise Slim Fit Lin Naturel",
    category: "Homme",
    price: "79,00 €",
    totalSales: 164,
    revenue: "12 956,00 €",
    stock: 85,
  },
  {
    id: "DIV-A-501",
    productName: "Sac Cabas Cuir Pleine Fleur",
    category: "Accessoires",
    price: "180,00 €",
    totalSales: 89,
    revenue: "16 020,00 €",
    stock: 18,
  },
];

export default function TopProductTable() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const [products, setProducts] = useState<TopProduct[]>(demoMode ? DEFAULT_TOP_FASHION_PRODUCTS : []);

  useEffect(() => {
    async function loadDynamic() {
      try {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.topProducts)) {
            const mapped: TopProduct[] = json.data.topProducts.slice(0, 5).map((p: any) => ({
              id: p.code || p.id,
              productName: p.name,
              category: p.category || "Catalogue",
              price: `${Number(p.basePrice || 0).toFixed(2)} €`,
              totalSales: Number(p.units || 0),
              revenue: `${((Number(p.basePrice || 0)) * (p.salesCount || 25)).toFixed(2)} €`,
              stock: 0,
            }));
            setProducts(mapped.map((item) => ({ ...item, price: "—", revenue: "—", stock: 0 })));
          } else if (!demoMode) {
            setProducts([]);
          }
        }
      } catch {
        if (!demoMode) setProducts([]);
      }
    }
    loadDynamic();
  }, []);

  return (
    <div className="border border-slate-200/90 rounded-2xl w-full bg-white shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg text-slate-900 font-bold flex items-center gap-2">
            <TrendingUp className="size-5 text-slate-800" />
            <span>Articles de Mode les Plus Vendus</span>
          </h3>
          <p className="text-xs text-slate-500">
            Top des ventes et chiffre d'affaires généré par pièce
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
        >
          Voir le Catalogue →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent bg-slate-50/50 text-xs text-slate-700">
              <TableHead className="py-3 pl-6 font-bold">Vêtement / Modèle</TableHead>
              <TableHead className="py-3 font-bold">Rayon</TableHead>
              <TableHead className="py-3 font-bold">Prix Unitaire</TableHead>
              <TableHead className="py-3 font-bold">Ventes Totales</TableHead>
              <TableHead className="py-3 font-bold">Chiffre d'Affaires</TableHead>
              <TableHead className="py-3 font-bold text-right pr-6">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => (
              <TableRow
                key={item.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="py-3.5 pl-6 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-700">
                      <Shirt className="size-5 text-slate-800" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {item.productName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Réf: {item.id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                    {item.category}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 whitespace-nowrap text-xs font-bold text-slate-900">
                  {item.price}
                </TableCell>
                <TableCell className="py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                  {item.totalSales} pièces
                </TableCell>
                <TableCell className="py-3.5 whitespace-nowrap text-xs font-bold text-slate-900">
                  {item.revenue}
                </TableCell>
                <TableCell className="py-3.5 whitespace-nowrap text-right pr-6">
                  <Badge variant={item.stock <= 20 ? "warning" : "success"}>
                    {item.stock} en stock
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
