"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Pagination } from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import { Package } from "lucide-react";

interface ProductItem {
  id: string;
  code: string;
  title: string;
  material: string;
  stockQuantity: number;
  isAvailable: boolean;
  category?: { name: string } | null;
  basePrice: number;
  sizes?: string[];
}

const defaultFashionCatalogue: ProductItem[] = [
  {
    id: "prod-1",
    code: "DIV-H-101",
    title: "Costume 2 Pièces Laine Vierge",
    category: { name: "Homme" },
    stockQuantity: 45,
    isAvailable: true,
    material: "100% Laine Vierge Italienne",
    basePrice: 289.0,
    sizes: ["46", "48", "50", "52", "54"],
  },
  {
    id: "prod-2",
    code: "DIV-F-201",
    title: "Robe Longue Fluide Soie Sauvage",
    category: { name: "Femme" },
    stockQuantity: 60,
    isAvailable: true,
    material: "100% Soie Naturelle",
    basePrice: 195.0,
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "prod-3",
    code: "DIV-U-301",
    title: "Hoodie Oversize Signature Coton Bio",
    category: { name: "Homme" },
    stockQuantity: 120,
    isAvailable: true,
    material: "Coton Biologique 450 g/m²",
    basePrice: 89.0,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "prod-4",
    code: "DIV-H-102",
    title: "Chemise Slim Fit Lin Naturel",
    category: { name: "Homme" },
    stockQuantity: 85,
    isAvailable: true,
    material: "100% Lin Français",
    basePrice: 79.0,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "prod-5",
    code: "DIV-F-202",
    title: "Trench Coat Ceinturé Imperméable",
    category: { name: "Femme" },
    stockQuantity: 32,
    isAvailable: true,
    material: "Gabardine Coton Déperlant",
    basePrice: 245.0,
    sizes: ["S", "M", "L"],
  },
  {
    id: "prod-6",
    code: "DIV-E-401",
    title: "Ensemble Cérémonie Enfant",
    category: { name: "Enfant" },
    stockQuantity: 40,
    isAvailable: true,
    material: "Coton & Lin Doux",
    basePrice: 65.0,
    sizes: ["4A", "6A", "8A", "10A", "12A"],
  },
  {
    id: "prod-7",
    code: "DIV-A-501",
    title: "Sac Cabas Cuir Pleine Fleur Italien",
    category: { name: "Accessoires" },
    stockQuantity: 18,
    isAvailable: true,
    material: "Cuir Tannage Végétal",
    basePrice: 180.0,
    sizes: ["Taille Unique"],
  },
  {
    id: "prod-8",
    code: "DIV-A-502",
    title: "Ceinture Cuir Vintage Boucle Dorée",
    category: { name: "Accessoires" },
    stockQuantity: 55,
    isAvailable: true,
    material: "Cuir Véritable",
    basePrice: 45.0,
    sizes: ["85", "90", "95", "100"],
  },
];

export default function StockUpdateTable() {
  const [products, setProducts] = useState<ProductItem[]>(defaultFashionCatalogue);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/products", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setProducts(json.data);
          }
        }
      } catch (err) {
        console.warn("Could not load products from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage]);

  const totalPages = Math.ceil(products.length / pageSize) || 1;

  const getStatus = (stock: number) => {
    if (stock <= 0) return { label: "Rupture", variant: "error" as const };
    if (stock <= 20) return { label: "Stock Faible", variant: "warning" as const };
    return { label: "En Stock", variant: "success" as const };
  };

  return (
    <div className="border border-gray-200/90 rounded-2xl w-full bg-white shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg text-gray-900 font-bold">
            État des Stocks & Collections Prêt-à-porter
          </h3>
          <p className="text-xs text-gray-500">
            Niveaux d'inventaire en direct par rayon (Homme, Femme, Enfant, Accessoires).
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Gérer le Catalogue →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent bg-gray-50/50 text-xs text-gray-700">
              <TableHead className="py-3 pl-6 font-bold">Article / Référence</TableHead>
              <TableHead className="py-3 font-bold">Rayon</TableHead>
              <TableHead className="py-3 whitespace-nowrap font-bold">Stock Total</TableHead>
              <TableHead className="py-3 font-bold">Statut</TableHead>
              <TableHead className="py-3 font-bold">Matière</TableHead>
              <TableHead className="py-3 font-bold text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-xs text-gray-500">
                  Actualisation des stocks...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Package className="size-6 text-gray-400 mx-auto" />
                    <p className="text-xs font-bold text-gray-800">Aucun vêtement dans l'inventaire</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item) => {
                const status = getStatus(item.stockQuantity);
                return (
                  <TableRow
                    key={item.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-3.5 pl-6 whitespace-nowrap">
                      <div>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          Réf: {item.code || "DIV-AUTO"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 whitespace-nowrap text-xs text-gray-600 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                        {item.category?.name || "Mode"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 whitespace-nowrap text-xs font-bold text-gray-900">
                      {item.stockQuantity} pièces
                    </TableCell>
                    <TableCell className="py-3.5 whitespace-nowrap">
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 whitespace-nowrap text-xs text-gray-600">
                      {item.material || "Coton / Soie"}
                    </TableCell>
                    <TableCell className="py-3.5 whitespace-nowrap text-right pr-6">
                      <Link
                        href={`/products/stocks`}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 hover:bg-indigo-600 hover:text-white transition-colors text-gray-700"
                      >
                        Ajuster tailles
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
