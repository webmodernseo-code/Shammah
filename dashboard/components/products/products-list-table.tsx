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

const FASHION_DATA = [
  {
    id: "DIV-H-101",
    name: "Costume 2 Pièces Laine Vierge",
    category: "Homme",
    price: "289,00 €",
    material: "100% Laine Vierge Italienne",
    stock: 45,
    status: "Publié",
    sizes: "46, 48, 50, 52, 54",
    image: "/images/products/fashion-1.jpg",
  },
  {
    id: "DIV-F-201",
    name: "Robe Longue Fluide Soie Sauvage",
    category: "Femme",
    price: "195,00 €",
    material: "100% Soie Naturelle",
    stock: 60,
    status: "Publié",
    sizes: "XS, S, M, L",
    image: "/images/products/fashion-2.jpg",
  },
  {
    id: "DIV-U-301",
    name: "Hoodie Oversize Signature Coton Bio",
    category: "Homme",
    price: "89,00 €",
    material: "Coton Biologique 450 g/m²",
    stock: 120,
    status: "Publié",
    sizes: "XS, S, M, L, XL, XXL",
    image: "/images/products/fashion-3.jpg",
  },
  {
    id: "DIV-H-102",
    name: "Chemise Slim Fit Lin Naturel",
    category: "Homme",
    price: "79,00 €",
    material: "100% Lin Français",
    stock: 85,
    status: "Publié",
    sizes: "S, M, L, XL",
    image: "/images/products/fashion-4.jpg",
  },
  {
    id: "DIV-F-202",
    name: "Trench Coat Ceinturé Imperméable",
    category: "Femme",
    price: "245,00 €",
    material: "Gabardine Coton Déperlant",
    stock: 32,
    status: "Publié",
    sizes: "S, M, L",
    image: "/images/products/fashion-5.jpg",
  },
  {
    id: "DIV-E-401",
    name: "Ensemble Cérémonie Enfant",
    category: "Enfant",
    price: "65,00 €",
    material: "Coton & Lin Doux",
    stock: 40,
    status: "Publié",
    sizes: "4A, 6A, 8A, 10A, 12A",
    image: "/images/products/fashion-6.jpg",
  },
  {
    id: "DIV-A-501",
    name: "Sac Cabas Cuir Pleine Fleur Italien",
    category: "Accessoires",
    price: "180,00 €",
    material: "Cuir Tannage Végétal",
    stock: 18,
    status: "Publié",
    sizes: "Taille Unique",
    image: "/images/products/fashion-7.jpg",
  },
  {
    id: "DIV-A-502",
    name: "Ceinture Cuir Vintage Boucle Dorée",
    category: "Accessoires",
    price: "45,00 €",
    material: "Cuir Véritable",
    stock: 55,
    status: "Publié",
    sizes: "85, 90, 95, 100",
    image: "/images/products/fashion-8.jpg",
  },
];

const categoryOptions = [
  { label: "Tous les rayons", value: "" },
  { label: "Homme", value: "Homme" },
  { label: "Femme", value: "Femme" },
  { label: "Enfant", value: "Enfant" },
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

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const dbItems = json.data.map((p: any) => ({
            id: p.id,
            code: p.code || p.id,
            name: p.title || p.name,
            category: p.category?.name || p.category || "Sans catégorie",
            price: `${Number(p.basePrice).toFixed(2).replace(".", ",")} €`,
            material: p.material || "100% Coton / Laine",
            stock: p.stockQuantity ?? 0,
            status: p.isAvailable !== false ? "Publié" : "Brouillon",
            sizes: p.variants?.map((v: any) => v.size).filter(Boolean).join(", ") || "Unique",
            image: p.imageRecto || "/images/products/fashion-1.jpg",
          }));

          setProducts(dbItems);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      !selectedCategory?.value || item.category === selectedCategory.value;
    const matchesStatus =
      !selectedStatus?.value || item.status === selectedStatus.value;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pageSize = 6;
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
            placeholder="Rechercher un vêtement, matière, réf..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <CustomSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Filtrer par rayon"
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
            className="btn btn-primary py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            + Nouvel Article Mode
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
            <TableHead className="text-xs font-semibold text-gray-600">Article / Modèle</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Rayon</TableHead>
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
                Aucun produit trouvé dans le catalogue.
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
                  {product.id}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-700">
                      <Shirt className="size-5 text-indigo-600" />
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
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                    {product.category}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-xs sm:text-sm text-indigo-600 whitespace-nowrap">
                  {product.price}
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {product.material}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`text-xs font-bold ${
                      product.stock <= 20 ? "text-amber-600" : "text-gray-800"
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
                      className="hover:text-indigo-600 p-1.5"
                      href={`/products/${product.id}`}
                      variant="icon"
                      title="Voir"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      className="hover:text-indigo-600 p-1.5"
                      variant="icon"
                      href={`/products/edit/${product.id}`}
                      title="Modifier"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      className="hover:text-red-500 p-1.5 text-gray-400"
                      variant="icon"
                      onClick={() => setIsDeleteModalOpen(true)}
                      title="Supprimer"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )))}
        </TableBody>
      </Table>

      <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Affichage de {filteredProducts.length} articles de mode
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(filteredProducts.length / pageSize))}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
