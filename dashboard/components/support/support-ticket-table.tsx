"use client";

import { useState } from "react";
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
import { Eye, Message01Icon } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { Headphones } from "lucide-react";

interface SupportTicket {
  id: string;
  userId: string;
  type: string;
  subject: string;
  status: "Ouvert" | "Fermé" | "En attente";
  date: string;
}

const supportData: SupportTicket[] = [
  {
    id: "TIC-4089",
    userId: "USR-102",
    type: "Conseil Style",
    subject: "Précision sur la coupe du costume 2 pièces (ajustée ou droite)",
    status: "Ouvert",
    date: "06 Sept, 2026",
  },
  {
    id: "TIC-4088",
    userId: "USR-109",
    type: "Livraison",
    subject: "Mise à jour d'adresse de livraison pour la commande #DIV-2026-848",
    status: "En attente",
    date: "05 Sept, 2026",
  },
  {
    id: "TIC-4085",
    userId: "USR-115",
    type: "Disponibilité",
    subject: "Demande de réassort sur la robe en soie rouge (Taille 38)",
    status: "Fermé",
    date: "03 Sept, 2026",
  },
];

const statusOptions = [
  { label: "Tous les statuts", value: "" },
  { label: "Ouvert", value: "Ouvert" },
  { label: "En attente", value: "En attente" },
  { label: "Fermé", value: "Fermé" },
];

const dateOptions = [
  { label: "Toutes les dates", value: "" },
  { label: "Plus récents", value: "newest" },
  { label: "Plus anciens", value: "oldest" },
];

export default function SupportTicketTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<Option | null>(null);
  const [dateSort, setDateSort] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredTickets = supportData.filter((item) => {
    const matchesStatus = !status?.value || item.status === status.value;
    const matchesSearch =
      !searchTerm ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredTickets.map((t) => t.id));
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
    filteredTickets.length > 0 && selectedRows.length === filteredTickets.length;

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-6 pb-4">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-7">
            Support Client & Tickets
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Centre de traitement des messages, questions et demandes d'assistance clients
          </p>
        </div>

        <div className="w-full md:w-auto flex justify-between gap-4 items-center flex-wrap">
          {/* Search */}
          <div className="w-full md:w-72">
            <SearchInput
              placeholder="Rechercher un ticket, sujet..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-visible flex-wrap pb-2 md:pb-0">
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
            <TableHead className="whitespace-nowrap pl-6 w-[50px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
                disabled={filteredTickets.length === 0}
              />
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Réf.</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Client ID</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Type de Demande</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Sujet / Message</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Statut</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <Headphones className="size-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Aucun ticket ouvert
                  </h4>
                  <p className="text-xs text-gray-500">
                    Tous les messages de contact et questions clients ont été traités avec succès.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredTickets.slice((currentPage - 1) * 10, currentPage * 10).map((item) => (
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
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.userId}
                </TableCell>
                <TableCell className="text-xs text-gray-700 font-medium whitespace-nowrap">
                  {item.type}
                </TableCell>
                <TableCell
                  className="text-xs text-gray-600 max-w-[300px] truncate"
                  title={item.subject}
                >
                  {item.subject}
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === "Ouvert" ? "success" : "warning"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.date}
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="icon"
                      href={`/support/${item.id.replace("#", "")}`}
                      className="hover:text-primary transition-colors"
                      title="Voir le ticket"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="icon"
                      className="hover:text-primary transition-colors"
                      title="Répondre"
                    >
                      <Message01Icon className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {filteredTickets.length > 0 && (
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTickets.length / 10)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
