"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  KeyRound, 
  FolderOpen, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import { SiCloudinary } from "@/components/common/brand-icons";
import Switch from "@/components/ui/switch";

type Config = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadFolder: string;
  isEnabled: boolean;
  configured?: boolean;
};

const emptyConfig: Config = {
  cloudName: "",
  apiKey: "",
  apiSecret: "",
  uploadFolder: "shammah/products",
  isEnabled: true,
  configured: false,
};

export default function MediaSettingsPage() {
  const [config, setConfig] = useState<Config>(emptyConfig);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/media")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setConfig(j.data);
      })
      .catch(() => toast.error("Impossible de charger la configuration média."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(action?: "test") {
    if (action === "test") setTesting(true);
    else setSaving(true);

    try {
      const res = await fetch("/api/settings/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Une erreur est survenue");

      if (action === "test") {
        toast.success("Connexion Cloudinary réussie et opérationnelle.");
      } else {
        toast.success("Paramètres Cloudinary enregistrés avec succès.");
        setConfig((prev) => ({ ...prev, configured: true }));
      }
    } catch (err: any) {
      toast.error(err?.message || "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm text-gray-500">
        Chargement des paramètres Cloudinary...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-[#3448C5]/10 border border-[#3448C5]/20 flex items-center justify-center shrink-0 shadow-2xs">
            <SiCloudinary className="size-6 text-[#3448C5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-950">
                Stockage & Médias Cloudinary
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  config.configured && config.isEnabled
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {config.configured && config.isEnabled ? "Connecté" : "En attente"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Hébergement haute performance et optimisation automatique des photos de produits
            </p>
          </div>
        </div>

        <a
          href="https://cloudinary.com/console"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-3.5 py-2 rounded-full transition-colors self-start sm:self-auto"
        >
          <span>Console Cloudinary</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Guide Box */}
      <div className="bg-linear-to-r from-emerald-50/70 to-amber-50/50 border border-emerald-200/70 rounded-2xl p-5 text-xs text-gray-700 leading-relaxed">
        <div className="flex items-start gap-2.5">
          <Sparkles className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-950 font-bold block mb-1">
              Comment associer votre compte Cloudinary en 1 minute :
            </strong>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Connectez-vous à votre compte sur <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">cloudinary.com</a>.</li>
              <li>Dans votre tableau de bord Cloudinary, repérez votre <strong>Cloud Name</strong>, <strong>API Key</strong> et <strong>API Secret</strong>.</li>
              <li>Copiez-les dans les champs ci-dessous puis cliquez sur <strong>Tester la connexion</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <KeyRound className="size-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-950">
              Identifiants de l'API Cloudinary
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600">
              Activer le stockage Cloudinary :
            </span>
            <Switch
              checked={config.isEnabled}
              onChange={(checked) => setConfig({ ...config, isEnabled: checked })}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Cloud Name */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Cloud Name *
            </label>
            <input
              type="text"
              value={config.cloudName}
              onChange={(e) => setConfig({ ...config, cloudName: e.target.value })}
              placeholder="ex: shammah-mode ou dx89xyz"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* API Key & API Secret */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                API Key *
              </label>
              <input
                type="text"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="ex: 123456789012345"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                API Secret *
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={config.apiSecret}
                  onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-gray-300 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Dossier Cloudinary */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <FolderOpen className="size-4 text-gray-500" />
              <span>Dossier de stockage Cloudinary</span>
            </label>
            <input
              type="text"
              value={config.uploadFolder}
              onChange={(e) => setConfig({ ...config, uploadFolder: e.target.value })}
              placeholder="shammah/products"
              className="w-full h-11 px-3.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Les photographies et visuels d'articles de mode seront classés automatiquement dans ce dossier sur votre Cloudinary.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Clés chiffrées & protégées côté serveur</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={testing || saving || !config.cloudName}
              onClick={() => handleSave("test")}
              className="px-5 py-2.5 rounded-full border border-gray-300 hover:border-gray-400 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {testing ? "Test en cours..." : "Tester la connexion"}
            </button>

            <button
              type="button"
              disabled={saving || testing}
              onClick={() => handleSave()}
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>{saving ? "Enregistrement..." : "Enregistrer les paramètres"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
