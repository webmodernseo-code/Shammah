"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Dummy Data matching the screenshot
const refundProductData = Array.from({ length: 15 }).map((_, i) => ({
  id: "#73423",
  productName: "Product Name",
  items: "20 pcs",
  amount: "$400",
  paymentStatus: "paid",
  status: "Pending",
  date: "12 Sept, 2027",
}));

export default function RefundProductList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(refundProductData.map((_, i) => String(i)));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (index: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, index]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== index));
    }
  };

  const isAllSelected =
    refundProductData.length > 0 &&
    selectedRows.length === refundProductData.length;

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-light-primary-text">
          Refunds Product
        </h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 border-b border-gray-100 font-semibold">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              ID
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Product Name
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Items
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Amount
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Payment status
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Status
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Date
            </TableHead>
            <TableHead className="text-light-primary-text font-semibold">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refundProductData.slice((currentPage - 1) * 10, currentPage * 10).map((item, index) => (
            <TableRow
              key={index}
              className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50"
            >
              <TableCell className="pl-6">
                <Checkbox
                  checked={selectedRows.includes(String(index))}
                  onCheckedChange={(checked) =>
                    toggleSelectRow(String(index), checked)
                  }
                />
              </TableCell>
              <TableCell className="text-sm text-light-secondary-text font-normal">
                {item.id}
              </TableCell>
              <TableCell className="text-sm text-light-secondary-text font-normal">
                {item.productName}
              </TableCell>
              <TableCell className="text-sm text-light-secondary-text font-normal">
                {item.items}
              </TableCell>
              <TableCell className="text-sm text-light-secondary-text font-normal">
                {item.amount}
              </TableCell>
              <TableCell>
                <div className="border border-teal-500 text-teal-500 rounded-full px-3 py-0.5 inline-block text-xs font-medium uppercase">
                  {item.paymentStatus}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="success">{item.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-light-secondary-text font-normal">
                {item.date}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Button className="rounded-full px-4 h-8 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white min-w-[80px]">
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full px-4 h-8 text-xs font-semibold border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 min-w-[80px]"
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-6 border-t border-gray-100 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(refundProductData.length / 10)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
