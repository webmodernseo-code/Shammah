"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FloatingInput } from "@/components/ui/floating-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Lock } from "lucide-react";

export function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("admin@divinexpress.fr");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez renseigner votre email et mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Identifiants administrateur incorrects.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("divinexpress_admin_active_tab", "1");
        sessionStorage.setItem("divinexpress_last_activity", Date.now().toString());
      }

      toast.success("Connexion réussie. Bienvenue sur le tableau de bord !");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Impossible de joindre le serveur. Vérifiez votre connexion.");
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-start mb-6">
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
          Espace Administrateur
        </h1>
        <p className="text-gray-600 font-public-sans text-sm">
          Connectez-vous avec vos identifiants pour piloter les commandes, stocks et clients.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <FloatingInput
          label="Mot de passe"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
          className="h-12"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="size-3.5 text-emerald-600 shrink-0" />
            <span>Déconnexion automatique à la fermeture</span>
          </div>
          <Link
            href="/forgot-password"
            className="text-[13px] font-bold text-primary hover:text-primary-dark transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 py-3 text-base font-bold flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Vérification en cours...</span>
            </>
          ) : (
            <>
              <span>Se connecter au tableau de bord</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
