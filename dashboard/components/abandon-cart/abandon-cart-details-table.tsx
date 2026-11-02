"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchIcon, Trash } from "@/icons";
import Image from "next/image";
import CustomSelect, { Option } from "../ui/custom-select";
import DeleteModal from "../ui/delete-modal";

export default function AbandonCartDetailsTable() {
  const [cartItems, setCartItems] = useState(
    Array.from({ length: 4 }).map((_, i) => ({
      id: `#${73423 + i}`,
      name: `Product Style ${i + 1}`,
      price: `$${(i + 1) * 120}`,
      image: `/images/products/${String((i % 24) + 1).padStart(2, "0")}.png`,
    })),
  );

  const [quantity, setQuantity] = useState<Option | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const quantityOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];

  return (
    <div className="border border-gray-500/20 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-4  p-4 sm:p-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute size-4 text-gray-500 left-4 top-1/2 -translate-y-1/2 " />
          <input
            type="text"
            placeholder="Search Product"
            className="pl-10 h-10 pr-4 w-full bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex-1">
          <CustomSelect
            options={quantityOptions}
            value={quantity}
            onChange={setQuantity}
            placeholder="Select Quantity"
            className="w-full h-10 bg-white text-dark-disabled-text"
          />
        </div>
        <Button size="md">Add Now</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox />
            </TableHead>
            <TableHead className="text-sm font-medium">ID</TableHead>
            <TableHead className="text-sm font-medium">Product</TableHead>
            <TableHead className="text-left text-sm font-medium ">
              Amount
            </TableHead>
            <TableHead className="text-left text-sm font-medium  pr-6">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.map((item, index) => (
            <TableRow
              key={index}
              className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
            >
              <TableCell className="pl-6 whitespace-nowrap">
                <Checkbox />
              </TableCell>
              <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                {item.id}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg shrink-0 relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-sm text-light-secondary-text">
                    {item.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-left text-light-secondary-text whitespace-nowrap">
                {item.price}
              </TableCell>
              <TableCell className="pr-6 text-left whitespace-nowrap">
                <Button
                  variant="icon"
                  className="hover:text-error"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
