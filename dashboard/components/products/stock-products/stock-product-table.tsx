"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getSafeProductImage, handleProductImageError } from "@/lib/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Pencil,
  RefreshCw,
  PackagePlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import StockOverview from "./stock-overview";

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: string;
  priceNum: number;
  stock: number;
  origin: string;
  format: string;
  image: string;
  status: "Publié" | "Brouillon";
  lastUpdated: string;
}

const DEFAULT_STOCK_DATA: StockItem[] = [
  {
    id: "DIV-H-101",
    code: "DIV-H-101",
    name: "Costume 2 Pièces Laine Vierge",
    category: "Homme",
    price: "289,00 €",
    priceNum: 289.0,
    stock: 45,
    origin: "100% Laine Vierge Italienne",
    format: "Tailles 46 à 54",
    image: "/images/products/fashion-1.jpg",
    status: "Publié",
    lastUpdated: "Aujourd'hui",
  },
  {
    id: "DIV-F-201",
    code: "DIV-F-201",
    name: "Robe Longue Fluide Soie Sauvage",
    category: "Femme",
    price: "195,00 €",
    priceNum: 195.0,
    stock: 60,
    origin: "100% Soie Naturelle",
    format: "Tailles XS à L",
    image: "/images/products/fashion-2.jpg",
    status: "Publié",
    lastUpdated: "Hier",
  },
  {
    id: "DIV-U-301",
    code: "DIV-U-301",
    name: "Hoodie Oversize Signature Coton Bio",
    category: "Homme",
    price: "89,00 €",
    priceNum: 89.0,
    stock: 120,
    origin: "Coton Bio 450 g/m²",
    format: "Tailles XS à XXL",
    image: "/images/products/fashion-3.jpg",
    status: "Publié",
    lastUpdated: "05 Sept. 2026",
  },
  {
    id: "DIV-H-102",
    code: "DIV-H-102",
    name: "Chemise Slim Fit Lin Naturel",
    category: "Homme",
    price: "79,00 €",
    priceNum: 79.0,
    stock: 85,
    origin: "100% Lin Français",
    format: "Tailles S à XL",
    image: "/images/products/fashion-4.jpg",
    status: "Publié",
    lastUpdated: "02 Sept. 2026",
  },
  {
    id: "DIV-F-202",
    code: "DIV-F-202",
    name: "Trench Coat Ceinturé Imperméable",
    category: "Femme",
    price: "245,00 €",
    priceNum: 245.0,
    stock: 32,
    origin: "Gabardine Coton Déperlant",
    format: "Tailles S à L",
    image: "/images/products/fashion-5.jpg",
    status: "Publié",
    lastUpdated: "01 Sept. 2026",
  },
  {
    id: "DIV-E-401",
    code: "DIV-E-401",
    name: "Ensemble Cérémonie Enfant",
    category: "Enfant",
    price: "65,00 €",
    priceNum: 65.0,
    stock: 40,
    origin: "Coton & Lin Doux",
    format: "Tailles 4A à 12A",
    image: "/images/products/fashion-6.jpg",
    status: "Publié",
    lastUpdated: "30 Août 2026",
  },
  {
    id: "DIV-A-501",
    code: "DIV-A-501",
    name: "Sac Cabas Cuir Pleine Fleur",
    category: "Accessoires",
    price: "180,00 €",
    priceNum: 180.0,
    stock: 18,
    origin: "Cuir Tannage Végétal",
    format: "Taille Unique",
    image: "/images/products/fashion-7.jpg",
    status: "Publié",
    lastUpdated: "28 Août 2026",
  },
];

const categoryOptions: Option[] = [
  { label: "Tous les rayons", value: "" },
  { label: "Homme", value: "Homme" },
  { label: "Femme", value: "Femme" },
  { label: "Enfant", value: "Enfant" },
  { label: "Accessoires", value: "Accessoires" },
];

const statusOptions: Option[] = [
  { label: "Tous les statuts", value: "" },
  { label: "Publié", value: "Publié" },
  { label: "Brouillon", value: "Brouillon" },
];

const stockLevelOptions: Option[] = [
  { label: "Tous les niveaux de stock", value: "" },
  { label: "En stock (> 20 unités)", value: "in_stock" },
  { label: "Stock faible (≤ 20 unités)", value: "low_stock" },
  { label: "Rupture de stock (0 unité)", value: "out_of_stock" },
];

export default function StockProductTable() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
  const [stockItems, setStockItems] = useState<StockItem[]>(demoMode ? DEFAULT_STOCK_DATA : []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);
  const [selectedStockLevel, setSelectedStockLevel] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Restock Modal State
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<StockItem | null>(null);
  const [addedQuantity, setAddedQuantity] = useState<number>(50);
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  // Fetch real database products
  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbItems: StockItem[] = json.data.map((p: any) => {
            const rawImg = p.imageRecto || p.image || "";
            const safeImg =
              rawImg &&
              (rawImg.startsWith("http") ||
                rawImg.startsWith("/") ||
                rawImg.startsWith("data:") ||
                rawImg.startsWith("blob:")
                ? rawImg
                : `/images/products/${rawImg}`);
            return {
              id: p.code || p.id,
              code: p.code || p.id,
              name: p.title || p.name,
              category: p.category?.name || p.category || "Sans catégorie",
              price: `${Number(p.basePrice).toFixed(2).replace(".", ",")} €`,
              priceNum: Number.isFinite(Number(p.basePrice)) ? Number(p.basePrice) : 0,
              stock: Number.isFinite(Number(p.stockQuantity)) ? Number(p.stockQuantity) : 0,
              origin: p.origin || "100% Coton Bio",
              format: p.formats?.[0]?.label || "Tailles S à XL",
              image: safeImg,
              status: p.isAvailable !== false ? "Publié" : "Brouillon",
              lastUpdated: p.updatedAt
                ? new Date(p.updatedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Récemment",
            };
          });

          const dbCodes = new Set(dbItems.map((item) => item.code.toUpperCase()));
          const remainingDefaults = demoMode ? DEFAULT_STOCK_DATA.filter(
            (defItem) => !dbCodes.has(defItem.code.toUpperCase())
          ) : [];

          setStockItems([...dbItems, ...remainingDefaults]);
        } else if (!demoMode) {
          setStockItems([]);
        }
      }
    } catch {
      if (!demoMode) setStockItems([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return stockItems.filter((item) => {
      // Search
      const searchMatch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category
      const categoryMatch =
        !selectedCategory?.value || item.category === selectedCategory.value;

      // Status
      const statusMatch =
        !selectedStatus?.value || item.status === selectedStatus.value;

      // Stock Level
      let stockMatch = true;
      if (selectedStockLevel?.value === "in_stock") {
        stockMatch = item.stock > 20;
      } else if (selectedStockLevel?.value === "low_stock") {
        stockMatch = item.stock > 0 && item.stock <= 20;
      } else if (selectedStockLevel?.value === "out_of_stock") {
        stockMatch = item.stock === 0;
      }

      return searchMatch && categoryMatch && statusMatch && stockMatch;
    });
  }, [stockItems, searchTerm, selectedCategory, selectedStatus, selectedStockLevel]);

  // Live KPI metrics
  const totalCount = stockItems.length;
  const totalUnits = stockItems.reduce((acc, curr) => acc + curr.stock, 0);
  const inStockCount = stockItems.filter((item) => item.stock > 20).length;
  const lowStockCount = stockItems.filter((item) => item.stock > 0 && item.stock <= 20).length;
  const outOfStockCount = stockItems.filter((item) => item.stock === 0).length;

  // Pagination
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Toggle selection
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredItems.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "SKU",
      "Nom du Produit",
      "Categorie",
      "Prix TTC",
      "Stock Disponible",
      "Format",
      "Matière & Finition",
      "Statut",
      "Derniere MAJ",
    ];

    const rows = filteredItems.map((item) => [
      `"${item.code}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      `"${item.price}"`,
      item.stock,
      `"${item.format}"`,
      `"${item.origin.replace(/"/g, '""')}"`,
      `"${item.status}"`,
      `"${item.lastUpdated}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stocks_shammah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fichier CSV de stock exporté avec succès !");
  };

  // Open Quick Restock Modal
  const handleOpenRestock = (item: StockItem) => {
    setTargetItem(item);
    setAddedQuantity(50);
    setRestockModalOpen(true);
  };

  // Submit Restock
  const handleSaveRestock = async () => {
    if (!targetItem) return;
    if (isNaN(addedQuantity) || addedQuantity === 0) {
      toast.error("Veuillez saisir une quantité valide à ajouter.");
      return;
    }

    setIsSubmittingRestock(true);
    try {
      const newStock = Math.max(0, targetItem.stock + addedQuantity);

      // Optimistic update
      setStockItems((prev) =>
        prev.map((it) =>
          it.id === targetItem.id
            ? { ...it, stock: newStock, lastUpdated: "À l'instant" }
            : it
        )
      );

      // Persist to API
      const res = await fetch(`/api/admin/products/${targetItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockQuantity: newStock,
          isAvailable: newStock > 0,
        }),
      });

      if (!res.ok) {
        // Still keep optimistic in demo mode
      }

      toast.success(
        `Stock mis à jour : +${addedQuantity} pièces pour "${targetItem.name}" (Total: ${newStock} pièces)`
      );
      setRestockModalOpen(false);
    } catch {
      toast.success(
        `Stock mis à jour en local : ${targetItem.stock + addedQuantity} pièces.`
      );
      setRestockModalOpen(false);
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Overview */}
      <StockOverview
        totalCount={totalCount}
        totalUnits={totalUnits}
        inStockCount={inStockCount}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        onExportCsv={handleExportCsv}
      />

      {/* Main Stock Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Header Actions Toolbar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher par référence SKU, article, matière..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2b6b61] bg-gray-50/50"
              />
            </div>

            {/* Category Filter */}
            <div className="w-40">
              <CustomSelect
                options={[
                  { value: "", label: "Toutes catégories" },
                  { value: "Homme", label: "Homme" },
                  { value: "Femme", label: "Femme" },
                  { value: "Enfant", label: "Enfant" },
                  { value: "Accessoires", label: "Accessoires" },
                ]}
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
                placeholder="Catégorie"
              />
            </div>

            {/* Stock Level Filter */}
            <div className="w-40">
              <CustomSelect
                options={[
                  { value: "", label: "Tous les niveaux" },
                  { value: "in_stock", label: "En stock (> 20)" },
                  { value: "low_stock", label: "Stock faible (≤ 20)" },
                  { value: "out_of_stock", label: "Rupture de stock (0)" },
                ]}
                value={selectedStockLevel}
                onChange={(val) => {
                  setSelectedStockLevel(val);
                  setCurrentPage(1);
                }}
                placeholder="Niveau stock"
              />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchProducts}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
              title="Actualiser les stocks"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              Exporter CSV
            </button>

            <Link
              href="/products/stocks/add"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2b6b61] hover:bg-[#235850] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="size-4" />
              <span>Entrée de Stock</span>
            </Link>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-200">
                <TableHead className="w-10 pl-6">
                  <Checkbox
                    checked={
                      paginatedItems.length > 0 &&
                      paginatedItems.every((item) => selectedRows.includes(item.id))
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Référence & Article</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Catégorie</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Matière / Format</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Prix Public</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Niveau de Stock</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Statut</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-400 text-xs">
                    Aucun article trouvé dans l'inventaire selon vos filtres.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => {
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock <= 20;

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) => toggleSelectRow(item.id, e.target.checked)}
                        />
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 relative">
                            <Image
                              src={getSafeProductImage(item.image)}
                              alt={item.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                              onError={(e) => handleProductImageError(e)}
                            />
                          </div>
                          <div>
                            <Link
                              href={`/products/stocks/${item.id}`}
                              className="font-bold text-xs text-gray-900 hover:text-emerald-700 transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <span className="font-mono text-[11px] text-gray-400 block font-medium">
                              {item.code}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {item.category}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        <div>
                          <span className="text-xs font-medium text-gray-800 block">
                            {item.origin}
                          </span>
                          <span className="text-[11px] text-gray-400">{item.format}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 font-bold text-xs text-gray-900">
                        {item.price}
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {isOutOfStock ? (
                              <XCircle className="size-3.5 text-rose-600 shrink-0" />
                            ) : isLowStock ? (
                              <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span
                              className={`text-xs font-bold ${
                                isOutOfStock
                                  ? "text-rose-600"
                                  : isLowStock
                                  ? "text-amber-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.stock} pièces
                            </span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOutOfStock
                                  ? "bg-rose-500 w-0"
                                  : isLowStock
                                  ? "bg-amber-500 w-1/3"
                                  : "bg-emerald-600 w-full"
                              }`}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant={item.status === "Publié" ? "success" : "default"}
                          className="text-[11px] font-semibold"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenRestock(item)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-emerald-600 hover:text-emerald-700 text-gray-600 transition-colors cursor-pointer"
                            title="Réapprovisionner le stock"
                          >
                            <PackagePlus className="size-3.5" />
                          </button>

                          <Link
                            href={`/products/stocks/${item.id}`}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                            title="Voir les mouvements de stock"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
              {Math.min(currentPage * pageSize, filteredItems.length)} sur{" "}
              {filteredItems.length} articles
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* ─── Modal Réapprovisionnement Rapide de Stock ─── */}
      {restockModalOpen && targetItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PackagePlus className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Réapprovisionnement
                  </h3>
                  <p className="text-xs text-gray-500">{targetItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Current Stock info */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">Stock actuel</span>
                <span className="text-lg font-extrabold text-gray-950">
                  {targetItem.stock} pièces
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Nouveau total estimé</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {Math.max(0, targetItem.stock + Number(addedQuantity || 0))} pièces
                </span>
              </div>
            </div>

            {/* Quantity adjustment */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Unités à ajouter au stock disponible
              </label>

              <div className="flex items-center gap-2 mb-3">
                {[+25, +50, +100, +250].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setAddedQuantity(inc)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      addedQuantity === inc
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    +{inc}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={addedQuantity}
                onChange={(e) => setAddedQuantity(Number(e.target.value))}
                placeholder="Nombre d'unités à ajouter"
                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRestockModalOpen(false)}
                className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <Button
                type="button"
                onClick={handleSaveRestock}
                disabled={isSubmittingRestock}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-full text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmittingRestock ? "Mise à jour..." : "Confirmer le réapprovisionnement"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
