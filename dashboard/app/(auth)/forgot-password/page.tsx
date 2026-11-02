import { Suspense } from "react";
import type { Metadata } from "next";
import ForgotPasswordPanel from "@/components/auth/ForgotPasswordPanel";

export const metadata: Metadata = {
  title: "Mot de Passe Oublié — DivinExpress Espace Admin",
  description: "Récupération sécurisée de votre accès administrateur DivinExpress.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
          Chargement du formulaire de récupération...
        </div>
      }
    >
      <ForgotPasswordPanel />
    </Suspense>
  );
}
