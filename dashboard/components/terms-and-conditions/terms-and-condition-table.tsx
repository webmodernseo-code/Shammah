"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { SearchIcon, Pencil, Trash } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";

// Dummy Data matching the screenshot
const termsData = Array.from({ length: 15 }).map((_, i) => ({
  id: "#73423",
  language: "English",
  title: "Default Terms &\nConditions",
  details:
    "Delivery usually takes 2-5 business days, depending on your location and the selected...",
  shortOrder: "12",
  status: "Published",
}));

const statusOptions = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

const typeOptions = [
  { label: "Type 1", value: "type1" },
  { label: "Type 2", value: "type2" },
];

export default function TermsAndConditionTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<Option | null>(null);
  const [type, setType] = useState<Option | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Terms & Conditions
          </h3>
          <div className="flex items-center gap-3">
            <Button href="/terms-and-conditions/add">
              Create Terms & Conditions
            </Button>
          </div>
        </div>

        <div className="w-full sm:w-auto flex justify-between gap-4 items-center flex-wrap">
          {/* Search */}
          <SearchInput />
          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto sm:pb-0">
            <div className="w-1/2 sm:min-w-[100px]">
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={setStatus}
                placeholder="Status"
              />
            </div>
            <div className="w-1/2 sm:min-w-[100px]">
              <CustomSelect
                options={typeOptions}
                value={type}
                onChange={setType}
                placeholder="Type"
              />
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="pl-6">ID</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Short Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {termsData
            .slice((currentPage - 1) * 6, currentPage * 6)
            .map((item, index) => (
              <TableRow
                key={index}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 font-normal text-sm text-light-secondary-text whitespace-nowrap">
                  {item.id}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {item.language}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {item.title}
                </TableCell>
                <TableCell
                  className="text-sm text-light-secondary-text max-w-[300px] truncate"
                  title={item.details}
                >
                  {item.details}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text">
                  {item.shortOrder}
                </TableCell>
                <TableCell>
                  <Badge variant="success">{item.status}</Badge>
                </TableCell>

                <TableCell className="pr-6">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="icon"
                      className="hover:text-primary transition-colors"
                      href="/terms-and-conditions/edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="icon"
                      className="hover:text-red-500 transition-colors"
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

      <div className="p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(termsData.length / 6)}
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
