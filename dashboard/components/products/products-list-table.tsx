"use client";

import { useEffect, useState } from "react";
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
import { Eye, Pencil, Trash } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { toast } from "sonner";

const categoryOptions = [
  { label: "Toutes les catégories", value: "" },
  { label: "T-shirts", value: "T-shirts" },
  { label: "Sweats à capuche", value: "Sweats à capuche" },
  { label: "Casquettes", value: "Casquettes" },
  { label: "Accessoires", value: "Accessoires" },
];

const statusOptions = [
  { label: "Tous les statuts", value: "" },
  { label: "Publié", value: "Publié" },
  { label: "Brouillon", value: "Brouillon" },
];

export default function ProductListTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/admin/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const dbItems = json.data.map((p: any) => {
            const uniqueSizes = Array.from(
              new Set(p.variants?.map((v: any) => v.size).filter(Boolean))
            );
            return {
              id: p.id,
              code: p.code || p.id,
              name: p.title || p.name,
              category: p.category?.name || p.category || "T-shirts",
              price: `${Number(p.basePrice).toFixed(2).replace(".", ",")} €`,
              material: p.material || "100% Coton Biologique",
              stock: p.stockQuantity ?? 0,
              status: p.isAvailable !== false ? "Publié" : "Brouillon",
              sizes: uniqueSizes.length > 0 ? uniqueSizes.join(", ") : "Unique",
              image: p.imageRecto || "/images/cls-categories/pod/t-shirts-jesus.jpg",
            };
          });

          setProducts(dbItems);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/products/${encodeURIComponent(productToDelete.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression.");
      }

      toast.success(data.message || "Article supprimé avec succès.");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer cet article.");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      !selectedCategory?.value || item.category === selectedCategory.value;
    const matchesStatus =
      !selectedStatus?.value || item.status === selectedStatus.value;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pageSize = 12;
  const isAllSelected =
    filteredProducts.length > 0 &&
    selectedRows.length === filteredProducts.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredProducts.map((p) => p.id));
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

  return (
    <div className="border border-gray-200 rounded-2xl w-full bg-white shadow-xs">
      {/* Search & Filters */}
      <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
        <div className="w-full md:w-72">
          <SearchInput
            placeholder="Rechercher un article, matière, réf..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <CustomSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Filtrer par catégorie"
            />
          </div>
          <div className="w-full sm:w-36">
            <CustomSelect
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Statut"
            />
          </div>
          <Link
            href="/products/add"
            className="btn btn-primary py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap bg-[#2b6b61] hover:bg-[#22564e] text-white shadow-xs transition-colors"
          >
            + Ajouter un article
          </Link>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-200">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Réf.</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Article / Création</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Catégorie</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Prix TTC</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Matière</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Stock Total</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Statut</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-xs text-slate-400">
                Chargement des articles du catalogue...
              </TableCell>
            </TableRow>
          ) : filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-xs text-slate-500">
                Aucun article trouvé dans le catalogue. Cliquez sur « + Ajouter un article » pour en créer un.
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((product) => (
                <TableRow
                  key={product.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(product.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                    {product.code}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-white border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <Shirt className="size-5 text-[#2b6b61]" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                          {product.name}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          Tailles : {product.sizes}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-700 font-semibold">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-xs sm:text-sm text-[#101828] whitespace-nowrap">
                    {product.price}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                    {product.material}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={`text-xs font-bold ${
                        product.stock <= 10 ? "text-amber-600" : "text-gray-800"
                      }`}
                    >
                      {product.stock} pièces
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        product.status === "Publié" ? "success" : "warning"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        className="hover:text-[#2b6b61] p-1.5"
                        href={`/products/${product.id}`}
                        variant="icon"
                        title="Voir"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        className="hover:text-[#2b6b61] p-1.5"
                        variant="icon"
                        href={`/products/edit/${product.id}`}
                        title="Modifier"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        className="hover:text-red-500 p-1.5 text-gray-400"
                        variant="icon"
                        onClick={() => {
                          setProductToDelete(product);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Supprimer"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>

      <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Affichage de {filteredProducts.length} article{filteredProducts.length > 1 ? "s" : ""} Shammah
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(filteredProducts.length / pageSize))}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
