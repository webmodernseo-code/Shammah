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
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { RotateCcw } from "lucide-react";

interface RefundItem {
  id: string;
  orderId: string;
  customer: string;
  amount: string;
  paymentMethod: string;
  reason: string;
  status: "Traité" | "En attente" | "Refusé";
  date: string;
}

const refundsData: RefundItem[] = [];

const paymentMethodOptions = [
  { label: "Tous les modes", value: "" },
  { label: "Carte Bancaire / Stripe", value: "card" },
  { label: "PayPal", value: "paypal" },
  { label: "Apple Pay", value: "applepay" },
];

const statusOptions = [
  { label: "Tous les statuts", value: "" },
  { label: "Traité", value: "Traité" },
  { label: "En attente", value: "En attente" },
  { label: "Refusé", value: "Refusé" },
];

const dateOptions = [
  { label: "Toutes les dates", value: "" },
  { label: "Aujourd'hui", value: "today" },
  { label: "Cette semaine", value: "week" },
  { label: "Ce mois-ci", value: "month" },
];

export default function RefundTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);
  const [dateSort, setDateSort] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredRefunds = refundsData.filter((r) => {
    const matchesStatus = !status?.value || r.status === status.value;
    const matchesSearch =
      !searchTerm ||
      r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredRefunds.map((r) => r.id));
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

  const isAllSelected =
    filteredRefunds.length > 0 && selectedRows.length === filteredRefunds.length;

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-7">
              Remboursements
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Historique et traitement des avoirs et remboursements clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" className="text-xs font-bold px-4 py-2 rounded-xl">
              Exporter
            </Button>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
          {/* Search */}
          <div className="w-full lg:w-72">
            <SearchInput
              placeholder="Rechercher par commande, client..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 flex-wrap">
            <div className="min-w-[150px]">
              <CustomSelect
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Mode de Paiement"
              />
            </div>
            <div className="min-w-[130px]">
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={setStatus}
                placeholder="Statut"
              />
            </div>
            <div className="min-w-[130px]">
              <CustomSelect
                options={dateOptions}
                value={dateSort}
                onChange={setDateSort}
                placeholder="Période"
              />
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
                onCheckedChange={toggleSelectAll}
                disabled={filteredRefunds.length === 0}
              />
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Réf.</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">N° Commande</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Client</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Montant</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Moyen de Paiement</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Motif</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Statut</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRefunds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <RotateCcw className="size-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Aucun remboursement enregistré
                  </h4>
                  <p className="text-xs text-gray-500">
                    Toutes les transactions sont stables et conformes.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredRefunds.slice((currentPage - 1) * 10, currentPage * 10).map((item) => (
              <TableRow
                key={item.id}
                className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRows.includes(item.id)}
                    onCheckedChange={(checked) =>
                      toggleSelectRow(item.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                  {item.id}
                </TableCell>
                <TableCell className="text-xs font-bold text-gray-900 whitespace-nowrap">
                  {item.orderId}
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.customer}
                </TableCell>
                <TableCell className="text-xs font-bold text-primary whitespace-nowrap">
                  {item.amount}
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.paymentMethod}
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.reason}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={item.status === "Traité" ? "success" : "warning"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.date}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button size="xs" variant="outline">
                    Voir Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {filteredRefunds.length > 0 && (
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRefunds.length / 10)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
