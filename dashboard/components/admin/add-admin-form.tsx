"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AddAdminForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invitation impossible.");
      toast.success(data.delivered
        ? `Invitation envoyée à ${email}.`
        : "Invitation créée. Vérifiez la configuration SMTP.");
      router.push("/admin-users");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invitation impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 border border-gray-200 shadow-2xs max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <PageHeader
          title="Ajouter un Collaborateur / Administrateur"
          backHref="/admin-users"
        />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="size-3.5" />
          <span>Accès Back Office DivinExpress</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-200/90 rounded-2xl p-5 sm:p-6 bg-gray-50/40 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Informations & Permissions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Jean Dupont"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Adresse email professionnelle *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: logistique@divinexpress.fr"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
              Un lien personnel valable 48 heures sera envoyé. Le collaborateur choisira lui-même son mot de passe sécurisé.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin-users")}
            className="w-full sm:w-auto rounded-full text-xs font-bold border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            Annuler
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !name || !email}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-full text-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{isSubmitting ? "Création..." : "Enregistrer le compte"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
