"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import StatusSelect, { Option } from "@/components/ui/status-select";

const statusOptions: Option[] = [
  { value: "Publié", label: "Publié" },
  { value: "Brouillon", label: "Brouillon" },
];

export default function FaqForm({ id }: { id?: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Général");
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/faqs/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "FAQ introuvable.");
        setQuestion(json.data.question);
        setAnswer(json.data.answer);
        setCategory(json.data.category);
        setStatus(statusOptions.find((item) => item.value === json.data.status) || statusOptions[1]);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (question.trim().length < 8 || answer.trim().length < 15) {
      toast.error("Renseignez une question et une réponse suffisamment détaillées.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(id ? `/api/admin/faqs/${encodeURIComponent(id)}` : "/api/admin/faqs", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category, status: status?.value }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Enregistrement impossible.");
      toast.success(id ? "FAQ mise à jour." : "FAQ créée.");
      router.push("/faq");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-2xl bg-white p-8 text-sm text-gray-500">Chargement de la FAQ…</div>;
  if (id === "") return <div className="rounded-2xl bg-white p-8 text-sm text-red-600">Identifiant de FAQ manquant.</div>;

  return (
    <form onSubmit={submit} className="w-full rounded-2xl bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader title={id ? "Modifier la FAQ" : "Nouvelle question FAQ"} backHref="/faq" className="gap-4" />
        <div className="w-36"><StatusSelect options={statusOptions} value={status} onChange={setStatus} /></div>
      </div>
      <div className="space-y-6">
        <div className="space-y-5 rounded-2xl border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">Contenu de la question</h2>
          <FloatingInput label="Question" value={question} onChange={(event) => setQuestion(event.target.value)} required minLength={8} />
          <FloatingTextarea label="Réponse" value={answer} onChange={(event) => setAnswer(event.target.value)} required minLength={15} rows={7} />
          <FloatingInput label="Catégorie" value={category} onChange={(event) => setCategory(event.target.value)} required />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/faq")}>Annuler</Button>
          <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : id ? "Enregistrer" : "Créer la FAQ"}</Button>
        </div>
      </div>
    </form>
  );
}
