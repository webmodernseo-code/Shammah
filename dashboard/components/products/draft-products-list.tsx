"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Eye, Trash, Pencil } from "@/icons";

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

// Mock Data
interface DraftProduct {
  id: string; // e.g. #73423
  productName: string;
  productImage?: string; // URL or null for placeholder
  category: string;
  price: string;
  seller: string;
  status: "Draft";
}

const categoryNames = [
  "Cloth",
  "Fashion",
  "Footwear",
  "Accessories",
  "Electronics",
  "Home",
];
const productNames = [
  "Lumberjack Jacket",
  "Denim Jeans",
  "Running Shoes",
  "Leather Belt",
  "Cotton T-Shirt",
  "Summer Hat",
  "Winter Scarf",
  "Smart Watch",
  "Sunglasses",
];
const sellerNames = [
  "Alex",
  "Jerome Bell",
  "Arlene McCoy",
  "Jane Cooper",
  "Guy Hawkins",
  "Eleanor Pena",
];

const draftProductsData: DraftProduct[] = Array(12)
  .fill(null)
  .map((_, i) => {
    const imageNum = (i % 24) + 1;
    const randomPrice = ((i * 20 + 15) % 150) + 10;

    return {
      id: `#${73423 + i}`,
      productName: productNames[i % productNames.length],
      productImage: `/images/products/${String(imageNum).padStart(2, "0")}.png`,
      category: categoryNames[i % categoryNames.length],
      price: `$${randomPrice}`,
      seller: sellerNames[i % sellerNames.length],
      status: "Draft",
    };
  });

const categoryOptions: Option[] = [
  { label: "Category", value: "" },
  { label: "Fashion", value: "fashion" },
  { label: "Electronics", value: "electronics" },
  { label: "Home", value: "home" },
];

const sellerOptions: Option[] = [
  { label: "Seller", value: "" },
  { label: "Eleanor Pena", value: "eleanor" },
  { label: "Jerome Bell", value: "jerome" },
];

const statusOptions: Option[] = [
  { label: "Status", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

export default function DraftProductsList() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Option | null>(null);
  const [sellerFilter, setSellerFilter] = useState<Option | null>(null);
  const [statusFilter, setStatusFilter] = useState<Option | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toggle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(draftProductsData.map((_, i) => `${i}`)); // Using index as key for demo
    } else {
      setSelectedProducts([]);
    }
  };

  // Toggle single selection
  const handleSelectRow = (index: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, index]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== index));
    }
  };

  const isAllSelected =
    draftProductsData.length > 0 &&
    selectedProducts.length === draftProductsData.length;

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl mb-4 sm:mb-6 font-bold text-light-primary-text leading-7.5">
            Draft Products
          </h3>

          {/* Top Search & Filter Section Layout */}
          <div>
            <div className="w-full flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
              {/* Search */}
              <SearchInput />
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="min-w-[140px]">
                  <CustomSelect
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categoryOptions}
                    placeholder="Category"
                  />
                </div>
                <div className="min-w-[140px]">
                  <CustomSelect
                    value={sellerFilter}
                    onChange={setSellerFilter}
                    options={sellerOptions}
                    placeholder="Seller"
                  />
                </div>
                <div className="min-w-[140px]">
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    placeholder="Status"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-left pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {draftProductsData.slice((currentPage - 1) * 10, currentPage * 10).map((item, index) => (
            <TableRow
              key={index}
              className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
            >
              <TableCell className="pl-6 whitespace-nowrap">
                <Checkbox
                  checked={selectedProducts.includes(`${index}`)}
                  onCheckedChange={(checked) =>
                    handleSelectRow(`${index}`, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                {item.id}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg overflow-hidden">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm text-light-secondary-text">
                    {item.productName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-light-secondary-text whitespace-nowrap">
                {item.category}
              </TableCell>
              <TableCell className="font-semibold text-sm text-primary whitespace-nowrap">
                {item.price}
              </TableCell>
              <TableCell className="text-light-secondary-text whitespace-nowrap">
                {item.seller}
              </TableCell>
              <TableCell>
                <Badge variant="warning">{item.status}</Badge>
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex items-center justify-start gap-1">
                  <Button
                    variant="icon"
                    href={`/products/drafts/${item.id.replace("#", "")}`}
                    className="hover:text-primary"
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="icon"
                    href={`/products/drafts/edit/${item.id.replace("#", "")}`}
                    className="hover:text-primary"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="icon"
                    className="hover:text-error"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(draftProductsData.length / 10)}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
        }}
      />
    </div>
  );
}
