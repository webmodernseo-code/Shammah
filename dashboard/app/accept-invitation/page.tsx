"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function AcceptInvitationForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 12) return setMessage("Le mot de passe doit contenir au moins 12 caractères.");
    if (password !== confirmation) return setMessage("Les mots de passe ne correspondent pas.");
    setLoading(true);
    const response = await fetch("/api/auth/accept-invitation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Impossible d'accepter l'invitation.");
      setLoading(false);
      return;
    }
    router.push("/signin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xs border border-gray-200">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Accepter l'invitation</h1>
          <p className="text-xs text-gray-500">Choisissez votre mot de passe pour activer votre accès administrateur DivinExpress.</p>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              minLength={12} 
              required 
              placeholder="12 caractères minimum"
              className="h-11 w-full rounded-xl border border-gray-300 px-3.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword((visible) => !visible)} 
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Confirmation du mot de passe
          </label>
          <div className="relative">
            <input 
              type={showConfirmation ? "text" : "password"} 
              value={confirmation} 
              onChange={(e) => setConfirmation(e.target.value)} 
              minLength={12} 
              required 
              placeholder="Répétez le mot de passe"
              className="h-11 w-full rounded-xl border border-gray-300 px-3.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmation((visible) => !visible)} 
              aria-label={showConfirmation ? "Masquer la confirmation" : "Afficher la confirmation"} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {message}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading || !token} 
          className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? "Activation en cours..." : "Activer mon compte administrateur"}
        </button>

        <div className="text-center pt-2">
          <Link href="/signin" className="text-xs font-medium text-primary hover:underline">
            Retour à la page de connexion
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-xs text-gray-400">Chargement de l'espace d'activation...</main>}>
      <AcceptInvitationForm />
    </Suspense>
  );
}
