"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Trash, MessageAdd } from "@/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { Star, CheckCircle, MessageSquareQuote } from "lucide-react";
import { getSafeProductImage, handleProductImageError } from "@/lib/product-image";

interface ProductReview {
  id: string;
  productName: string;
  productImage: string;
  user: string;
  review: string;
  rating: number; // 4 or 5
  status: "Publié" | "En attente";
  date: string;
}

const initialReviews: ProductReview[] = [
  {
    id: "REV-101",
    productName: "Costume 2 Pièces Laine Vierge",
    productImage: "/images/products/fashion-1.jpg",
    user: "Marc Dupont (Lyon)",
    review: "Coupe impeccable, le tissu en laine vierge italienne tombe parfaitement. Porté lors d'un mariage, que des compliments !",
    rating: 5,
    status: "Publié",
    date: "06 Sept, 2026",
  },
  {
    id: "REV-102",
    productName: "Robe Longue Fluide Soie Sauvage",
    productImage: "/images/products/fashion-2.jpg",
    user: "Sophie Laurent (Bordeaux)",
    review: "La fluidité de la soie est magnifique et la couleur vert sauge est sublime. Taille parfaitement.",
    rating: 5,
    status: "Publié",
    date: "05 Sept, 2026",
  },
  {
    id: "REV-103",
    productName: "Hoodie Oversize Signature Coton Bio",
    productImage: "/images/products/fashion-3.jpg",
    user: "Thomas Bernard (Toulouse)",
    review: "Un grammage très lourd (450g) et un molleton ultra doux. Les finitions sont dignes des plus grandes maisons.",
    rating: 5,
    status: "Publié",
    date: "04 Sept, 2026",
  },
  {
    id: "REV-104",
    productName: "Chemise Slim Fit Lin Naturel",
    productImage: "/images/products/fashion-4.jpg",
    user: "Alain Mercier (Nantes)",
    review: "Idéale pour l'été, le lin français est très respirant et la coupe cintrée met bien en valeur la silhouette.",
    rating: 5,
    status: "Publié",
    date: "03 Sept, 2026",
  },
  {
    id: "REV-105",
    productName: "Sac Cabas Cuir Pleine Fleur",
    productImage: "/images/products/fashion-7.jpg",
    user: "Camille Vasseur (Paris)",
    review: "Le cuir au tannage végétal sent délicieusement bon et la patine commence déjà à se former avec élégance.",
    rating: 5,
    status: "Publié",
    date: "01 Sept, 2026",
  },
];

const ratingOptions: Option[] = [
  { label: "Toutes les notes", value: "" },
  { label: "5 Étoiles (Exceptionnel)", value: "5" },
  { label: "4 Étoiles (Très bon)", value: "4" },
];

const dateOptions: Option[] = [
  { label: "Toutes les dates", value: "" },
  { label: "Plus récents", value: "newest" },
  { label: "Plus anciens", value: "oldest" },
];

export default function ProductReviewTable() {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredReviews = reviews.filter((r) => {
    const matchesRating =
      !ratingFilter?.value || r.rating === Number(ratingFilter.value);
    const matchesSearch =
      !searchTerm ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.review.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(filteredReviews.map((r) => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, id]);
    } else {
      setSelectedReviews((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllSelected =
    filteredReviews.length > 0 && selectedReviews.length === filteredReviews.length;

  // Solid Gold Vector Stars
  const renderSolidStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            viewBox="0 0 20 20"
            fill={star <= rating ? "#F59E0B" : "#E5E7EB"}
            className="size-4 shrink-0"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-6 pb-4">
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-7 flex items-center gap-2">
                <MessageSquareQuote className="size-5 text-amber-500" />
                <span>Avis Clients & Modération</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Retours vérifiés des clients sur les créations DivinExpress
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span>Note moyenne boutique : 4,9 / 5</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
            {/* Search */}
            <div className="w-full sm:w-72">
              <SearchInput
                placeholder="Rechercher par article, client, avis..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="min-w-[160px]">
                <CustomSelect
                  value={ratingFilter}
                  onChange={setRatingFilter}
                  options={ratingOptions}
                  placeholder="Filtrer par note"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-y border-gray-200">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                disabled={filteredReviews.length === 0}
              />
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Réf.</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Épice Évaluée</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Client</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Commentaire</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Note</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Statut</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 text-right pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReviews
            .slice((currentPage - 1) * 6, currentPage * 6)
            .map((item) => (
              <TableRow
                key={item.id}
                className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedReviews.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(item.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                  {item.id}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white p-0.5 flex items-center justify-center">
                      <img
                        src={getSafeProductImage(item.productImage, item.id, item.productName)}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                        onError={(e) => handleProductImageError(e, item.id, item.productName)}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {item.productName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-700 whitespace-nowrap font-medium">
                  {item.user}
                </TableCell>
                <TableCell className="max-w-[280px] text-xs text-gray-600">
                  <p className="line-clamp-2" title={item.review}>
                    "{item.review}"
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {renderSolidStars(item.rating)}
                </TableCell>
                <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                  {item.date}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={item.status === "Publié" ? "success" : "warning"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="icon"
                      className="hover:text-emerald-600 p-1.5"
                      title="Approuver l'avis"
                      onClick={() => {
                        setReviews((prev) =>
                          prev.map((r) =>
                            r.id === item.id ? { ...r, status: "Publié" } : r
                          )
                        );
                      }}
                    >
                      <CheckCircle className="size-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="icon"
                      className="hover:text-red-500 p-1.5 text-gray-400"
                      title="Supprimer"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Affichage de {filteredReviews.length} avis clients
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(filteredReviews.length / 6))}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            setReviews((prev) => prev.filter((r) => r.id !== itemToDelete));
          }
          setIsDeleteModalOpen(false);
        }}
      />
    </div>
  );
}
