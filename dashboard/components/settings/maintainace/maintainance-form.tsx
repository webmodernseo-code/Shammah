"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Power, Store } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_MESSAGE = "Notre boutique DivinExpress est momentanément en maintenance. Nous préparons de nouvelles collections et revenons très vite.";

export default function MaintenanceForm() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [expectedBackAt, setExpectedBackAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/maintenance", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setEnabled(Boolean(result.data?.enabled));
        setMessage(result.data?.message || DEFAULT_MESSAGE);
        setExpectedBackAt(result.data?.expectedBackAt ? new Date(result.data.expectedBackAt).toISOString().slice(0, 16) : "");
      })
      .catch(() => toast.error("Impossible de charger l'état de maintenance."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, message, expectedBackAt: expectedBackAt || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Enregistrement impossible.");
      toast.success(enabled ? "Mode maintenance activé. La boutique publique est fermée aux commandes." : "Boutique rouverte. Les clients peuvent de nouveau commander.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-5 animate-spin text-slate-500" /></div>;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
      <header className="flex items-start justify-between gap-5 border-b border-slate-100 p-6">
        <div className="flex gap-4">
          <span className={`flex size-11 items-center justify-center rounded-xl ${enabled ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"}`}>
            {enabled ? <AlertTriangle className="size-5" /> : <Store className="size-5" />}
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Disponibilité de la boutique</h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-500">Fermez temporairement la boutique en ligne lors d'arrivages ou de refontes. Le dashboard administrateur reste entièrement accessible.</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${enabled ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-800"}`}>
          {enabled ? "Maintenance active" : "Boutique ouverte"}
        </span>
      </header>

      <div className="space-y-5 p-6">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 p-4 hover:bg-slate-50/50 transition-colors">
          <span>
            <span className="block text-sm font-bold text-slate-900">Activer le mode maintenance</span>
            <span className="mt-0.5 block text-xs text-slate-500">Les visiteurs verront une page de maintenance sobre et ne pourront pas finaliser d'achat.</span>
          </span>
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-5 accent-slate-900 cursor-pointer" />
        </label>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Message affiché aux visiteurs
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={500}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-300 p-3.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>

        <div>
          <label className="block max-w-sm text-xs font-bold text-slate-700 mb-1.5">
            Réouverture estimée <span className="font-normal text-slate-400">(facultatif)</span>
          </label>
          <input
            type="datetime-local"
            value={expectedBackAt}
            onChange={(event) => setExpectedBackAt(event.target.value)}
            className="h-11 max-w-sm w-full rounded-xl border border-slate-300 px-3.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            onClick={save}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
              enabled ? "bg-amber-700 hover:bg-amber-800" : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
            <span>Enregistrer l'état de la boutique</span>
          </button>
        </div>
      </div>
    </section>
  );
}
