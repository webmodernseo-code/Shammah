"use client";

import { useEffect, useState } from "react";
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
import { Pencil, Trash } from "@/icons";
import { ShieldCheck, UserPlus, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  user: string;
  email: string;
  role: "Administrateur Principal" | "Gestionnaire Secondaire";
  isPrimary: boolean;
  date: string;
  activeStatus: "Actif" | "Suspendu" | "Invitation";
  avatar: string;
}

function AdminRoleIcon({ primary }: { primary: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
        primary
          ? "border-primary-dark bg-primary-darker text-white"
          : "border-gray-200 bg-gray-50 text-gray-700"
      }`}
      title={primary ? "Administrateur Principal" : "Gestionnaire"}
    >
      {primary ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
          <path d="M5 17.25h14M6.25 14.5l-1-7 4.15 3.15L12 5l2.6 5.65 4.15-3.15-1 7H6.25Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
          <circle cx="12" cy="8.25" r="3.25" stroke="currentColor" strokeWidth="1.65" />
          <path d="M5.75 18.5c.55-3.15 2.58-4.75 6.25-4.75s5.7 1.6 6.25 4.75" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
          <path d="m16.5 11.5 1.15 1.15L20 10.3" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export default function AdminListTable() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/users", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Chargement impossible.");
        const users: AdminUser[] = (data.users || []).map((user: any) => ({
          id: user.id,
          user: user.name || "Administrateur DivinExpress",
          email: user.email,
          role: user.role === "ADMIN" ? "Gestionnaire Secondaire" : "Administrateur Principal",
          isPrimary: user.role !== "ADMIN",
          date: new Date(user.createdAt).toLocaleDateString("fr-FR"),
          activeStatus: user.adminEnabled ? "Actif" : "Suspendu",
          avatar: "",
        }));
        const pending: AdminUser[] = (data.invitations || []).map((invite: any) => ({
          id: invite.id,
          user: invite.name || "Invitation en cours",
          email: invite.email,
          role: "Gestionnaire Secondaire",
          isPrimary: false,
          date: new Date(invite.createdAt).toLocaleDateString("fr-FR"),
          activeStatus: "Invitation",
          avatar: "",
        }));
        
        if (users.length === 0 && pending.length === 0) {
          setAdmins([
            {
              id: "ADM-001",
              user: "Direction DivinExpress",
              email: "admin@divinexpress.com",
              role: "Administrateur Principal",
              isPrimary: true,
              date: "01 Sept, 2026",
              activeStatus: "Actif",
              avatar: "",
            },
          ]);
        } else {
          setAdmins([...users, ...pending]);
        }
      })
      .catch(() => {
        setAdmins([
          {
            id: "ADM-001",
            user: "Direction DivinExpress",
            email: "admin@divinexpress.com",
            role: "Administrateur Principal",
            isPrimary: true,
            date: "01 Sept, 2026",
            activeStatus: "Actif",
            avatar: "",
          },
        ]);
      });
  }, []);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(admins.map((a) => a.id));
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
    admins.length > 0 && selectedRows.length === admins.length;

  async function revokeAccess(item: AdminUser) {
    if (!window.confirm(`Supprimer l'accès administrateur de ${item.email} ?`)) return;
    const response = await fetch(`/api/admin/users/${encodeURIComponent(item.id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) return toast.error(result.error || "Suppression impossible.");
    setAdmins((current) => current.filter((admin) => admin.id !== item.id));
    toast.success(item.activeStatus === "Invitation" ? "Invitation annulée." : "Accès administrateur supprimé.");
  }

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-6 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span>Gestion des Administrateurs & Rôles</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              1 Compte Direction propriétaire + accès délégués pour la gestion des articles et commandes
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin-users/add"
              className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <UserPlus className="size-4" />
              <span>+ Inviter un Administrateur</span>
            </Link>
          </div>
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
            <TableHead className="text-xs font-semibold text-gray-600">Administrateur</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Email de Connexion</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Rôle & Droits</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Date d'ajout</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600">Statut</TableHead>
            <TableHead className="text-xs font-semibold text-gray-600 pr-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins
            .slice((currentPage - 1) * 10, currentPage * 10)
            .map((item) => (
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
                <TableCell className="text-xs whitespace-nowrap text-gray-900 font-bold">
                  <div className="flex items-center gap-2.5">
                    <AdminRoleIcon primary={item.isPrimary} />
                    <span>{item.user}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap font-mono">
                  {item.email}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {item.isPrimary ? (
                    <Badge variant="success" className="font-bold flex items-center gap-1 w-fit">
                      <Lock className="size-3" />
                      <span>Principal (Protégé)</span>
                    </Badge>
                  ) : (
                    <Badge variant="default" className="w-fit">
                      Secondaire
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {item.date}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={item.activeStatus === "Actif" ? "success" : "warning"}>
                    {item.activeStatus}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="icon"
                      href={`/admin-users/edit?id=${item.id}`}
                      className="hover:text-primary transition-colors p-1.5"
                      title="Modifier les accès"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    {!item.isPrimary && (
                      <Button
                        variant="icon"
                        className="hover:text-red-500 transition-colors p-1.5 text-gray-400"
                        title="Révoquer l'accès"
                        onClick={() => revokeAccess(item)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {admins.length} compte(s) administrateur(s) configuré(s)
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(admins.length / 10))}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
