import { Suspense } from "react";
import type { Metadata } from "next";
import SetNewPasswordPanel from "@/components/auth/SetNewPasswordPanel";

export const metadata: Metadata = {
  title: "Réinitialiser le Mot de Passe — Shammah Espace Admin",
  description: "Mise à jour sécurisée du mot de passe administrateur Shammah.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
          Chargement...
        </div>
      }
    >
      <SetNewPasswordPanel />
    </Suspense>
  );
}
