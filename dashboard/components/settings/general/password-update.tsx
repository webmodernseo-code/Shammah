"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAdminSession } from "@/components/auth/admin-session-context";

export default function PasswordUpdate() {
  const identity = useAdminSession();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!oldPassword) {
      setStatusMessage({ type: "error", text: "Veuillez renseigner votre mot de passe actuel." });
      return;
    }
    if (
      newPassword.length < 12 ||
      newPassword.length > 128 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setStatusMessage({ type: "error", text: "Utilisez 12 caractères minimum avec majuscule, minuscule, chiffre et symbole." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Les deux nouveaux mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const message = data.error || "Échec de la mise à jour du mot de passe.";
        setStatusMessage({ type: "error", text: message });
        toast.error(message);
      } else {
        const message = data.message || "Mot de passe modifié avec succès !";
        setStatusMessage({ type: "success", text: message });
        toast.success(message);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setStatusMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <Lock className="size-5 text-slate-800" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Sécurité du Compte & Mot de Passe
          </h3>
          <p className="text-xs text-slate-500">
            Modification du mot de passe de {identity?.email || "votre compte administrateur"}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : "bg-red-50/80 border-red-200 text-red-900"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              tabIndex={-1}
              aria-label={showOld ? "Masquer" : "Afficher"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showOld ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={12}
              maxLength={128}
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              aria-label={showNew ? "Masquer" : "Afficher"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className={`mt-1.5 text-[11px] ${newPassword.length > 0 && newPassword.length < 12 ? "text-red-600 font-semibold" : "text-slate-500"}`}>
            12 caractères, majuscule, minuscule, chiffre et symbole ({newPassword.length}/12)
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={12}
              maxLength={128}
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              aria-label={showConfirm ? "Masquer" : "Afficher"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse items-start justify-between gap-3 pt-2 sm:flex-row sm:items-center">
        <Link
          href={`/forgot-password${identity?.email ? `?email=${encodeURIComponent(identity.email)}` : ""}`}
          className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          Mot de passe actuel oublié ? Recevoir un lien par e-mail
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16423C] hover:bg-[#1f5951] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16423C] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Mise à jour...</span>
            </>
          ) : (
            <span>Modifier et enregistrer mon mot de passe</span>
          )}
        </button>
      </div>
    </form>
  );
}
