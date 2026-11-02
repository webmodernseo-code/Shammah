"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getSafeProductImage, handleProductImageError } from "@/lib/product-image";

const productsData = [
  {
    name: "Costume 2 Pièces Laine Vierge",
    id: "DIV-H-101",
    image: "/images/products/fashion-1.jpg",
    category: "Homme — Luxe",
    items: 1,
    price: "289,00 €",
  },
  {
    name: "Robe Longue Fluide Soie Sauvage",
    id: "DIV-F-201",
    image: "/images/products/fashion-2.jpg",
    category: "Femme — Robes",
    items: 1,
    price: "195,00 €",
  },
  {
    name: "Hoodie Oversize Signature Coton Bio",
    id: "DIV-U-301",
    image: "/images/products/fashion-3.jpg",
    category: "Streetwear",
    items: 2,
    price: "178,00 €",
  },
];

export default function OrderSmallProductTable() {
  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded-2xl bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/70 hover:bg-gray-50/70 border-b border-gray-200">
            <TableHead className="pl-6 text-xs font-semibold text-gray-600">Article</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Catégorie</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Quantité</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Total TTC</TableHead>
            <TableHead className="pr-6 text-xs font-semibold text-gray-600 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productsData.map((product, index) => (
            <TableRow
              key={index}
              className="border-b  last:border-0 border-gray-500/20 hover:bg-gray-50/50"
            >
              <TableCell className="pl-6 py-2 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gray-50 border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                    <img
                      src={getSafeProductImage(product.image, product.id, product.name)}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => handleProductImageError(e, product.id, product.name)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-primary-text">
                      {product.name}
                    </p>
                    <p className="text-xs text-light-secondary-text">
                      ID: {product.id}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap py-2 text-light-secondary-text">
                {product.category}
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap py-2 text-light-secondary-text">
                {product.items}
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap py-2 font-medium text-light-primary-text">
                {product.price}
              </TableCell>
              <TableCell className="pr-6 py-2 whitespace-nowrap">
                <Button size="xs" variant="danger-outline">
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
