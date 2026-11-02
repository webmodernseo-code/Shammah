import { Suspense } from "react";
import type { Metadata } from "next";
import LoginPanel from "@/components/auth/LoginPanel";

export const metadata: Metadata = {
  title: "Connexion Espace Administration — Shammah",
  description: "Portail d'authentification sécurisé du Back Office Shammah.",
};

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans text-sm">
          Chargement du portail d'authentification Shammah...
        </div>
      }
    >
      <LoginPanel />
    </Suspense>
  );
}
