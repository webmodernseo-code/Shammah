"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Veuillez renseigner votre adresse email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success("Instructions envoyées avec succès !");
    } catch {
      toast.error("Impossible de contacter le serveur d'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-start mb-8">
        <Link href="/" className="mb-6 inline-block transition-transform hover:scale-102">
          <Image
            src="/images/logo/logo.png"
            alt="DivinExpress"
            width={210}
            height={65}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>
        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-1.5">
          Mot de Passe Oublié
        </h1>
        <p className="text-gray-600 font-public-sans text-sm">
          Saisissez votre adresse email pour recevoir votre lien sécurisé de réinitialisation.
        </p>
      </div>

      {sent ? (
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 mb-6">
          <div className="size-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-emerald-950">Email envoyé !</h3>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
            Si l'adresse <b>{email}</b> est associée à un compte administrateur, un email avec votre lien de réinitialisation vient de vous être envoyé.
          </p>
          <p className="text-xs text-emerald-700 pt-1">
            Vérifiez également votre dossier de courriers indésirables (Spams).
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FloatingInput
            label="Adresse email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
            className="h-12"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 py-3 text-base font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Envoi des instructions...</span>
              </>
            ) : (
              <span>Envoyer le lien de réinitialisation</span>
            )}
          </Button>
        </form>
      )}

      <p className="mt-8 text-sm text-light-secondary-text">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Retour à la page de connexion</span>
        </Link>
      </p>
    </div>
  );
}
