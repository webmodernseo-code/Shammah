"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "@/components/common/search-input";
import DeleteModal from "@/components/ui/delete-modal";

type FaqItem = { id: string; question: string; answer: string; category: string; status: string };
const statusOptions: Option[] = [
  { label: "Tous les statuts", value: "" },
  { label: "Publié", value: "Publié" },
  { label: "Brouillon", value: "Brouillon" },
];

export default function FaqTable() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<Option | null>(null);
  const [category, setCategory] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pageSize = 8;

  async function loadFaqs() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/faqs", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Chargement impossible.");
      setFaqs(json.data || []);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Chargement impossible.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadFaqs(); }, []);
  useEffect(() => { setCurrentPage(1); }, [status, category, searchTerm]);

  const categoryOptions = useMemo<Option[]>(() => [
    { label: "Toutes les catégories", value: "" },
    ...Array.from(new Set(faqs.map((faq) => faq.category))).sort().map((value) => ({ label: value, value })),
  ], [faqs]);
  const filteredFaqs = useMemo(() => faqs.filter((faq) => {
    const query = searchTerm.trim().toLocaleLowerCase("fr");
    return (!status?.value || faq.status === status.value)
      && (!category?.value || faq.category === category.value)
      && (!query || `${faq.question} ${faq.answer}`.toLocaleLowerCase("fr").includes(query));
  }), [faqs, status, category, searchTerm]);

  async function deleteFaq() {
    if (!selectedId) return;
    try {
      const response = await fetch(`/api/admin/faqs/${encodeURIComponent(selectedId)}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Suppression impossible.");
      setFaqs((current) => current.filter((faq) => faq.id !== selectedId));
      toast.success("FAQ supprimée.");
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Suppression impossible.");
    } finally { setSelectedId(null); }
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
      <div className="border-b border-gray-100 p-4 sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><HelpCircle className="size-5 text-primary" />Foire aux questions</h1><p className="mt-1 text-sm text-gray-500">Contenu d’aide publié sur la boutique.</p></div>
          <Link href="/faq/add" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><Plus className="size-4" />Nouvelle question</Link>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-80"><SearchInput placeholder="Rechercher une question…" onChange={(event) => setSearchTerm(event.target.value)} /></div>
          <div className="flex w-full gap-2 md:w-auto"><div className="w-full sm:w-52"><CustomSelect options={categoryOptions} value={category} onChange={setCategory} placeholder="Catégorie" /></div><div className="w-full sm:w-40"><CustomSelect options={statusOptions} value={status} onChange={setStatus} placeholder="Statut" /></div></div>
        </div>
      </div>
      <Table>
        <TableHeader><TableRow className="bg-gray-50"><TableHead className="pl-6">Référence</TableHead><TableHead>Question / réponse</TableHead><TableHead>Catégorie</TableHead><TableHead>Statut</TableHead><TableHead className="pr-6 text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {loading && <TableRow><TableCell colSpan={5} className="py-12 text-center text-sm text-gray-500">Chargement des questions…</TableCell></TableRow>}
          {!loading && error && <TableRow><TableCell colSpan={5} className="py-12 text-center"><p className="text-sm text-red-600">{error}</p><Button variant="outline" className="mt-3" onClick={() => void loadFaqs()}>Réessayer</Button></TableCell></TableRow>}
          {!loading && !error && filteredFaqs.length === 0 && <TableRow><TableCell colSpan={5} className="py-12 text-center text-sm text-gray-500">Aucune question. Créez la première FAQ pour commencer.</TableCell></TableRow>}
          {filteredFaqs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
            <TableRow key={item.id} className="border-gray-100">
              <TableCell className="pl-6 font-mono text-xs text-gray-500">{item.id.slice(-8).toUpperCase()}</TableCell>
              <TableCell className="max-w-xl"><p className="font-semibold text-gray-900">{item.question}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{item.answer}</p></TableCell>
              <TableCell><span className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs">{item.category}</span></TableCell>
              <TableCell><Badge variant={item.status === "Publié" ? "success" : "warning"}>{item.status}</Badge></TableCell>
              <TableCell className="pr-6"><div className="flex justify-end gap-1"><Button variant="icon" href={`/faq/edit?id=${encodeURIComponent(item.id)}`} title="Modifier"><Pencil className="size-4" /></Button><Button variant="icon" title="Supprimer" onClick={() => setSelectedId(item.id)}><Trash2 className="size-4" /></Button></div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t border-gray-100 p-4 sm:px-6"><p className="text-xs text-gray-500">{filteredFaqs.length} question(s)</p><Pagination currentPage={currentPage} totalPages={Math.max(1, Math.ceil(filteredFaqs.length / pageSize))} onPageChange={setCurrentPage} /></div>
      <DeleteModal isOpen={Boolean(selectedId)} onClose={() => setSelectedId(null)} onConfirm={() => void deleteFaq()} title="Supprimer cette question ?" description="Cette action est définitive." />
    </div>
  );
}
