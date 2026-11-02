import type { Metadata } from "next";
import LoginPanel from "@/components/auth/LoginPanel";

export const metadata: Metadata = {
  title: "Connexion Espace Administration — Shammah",
  description: "Portail d'authentification sécurisé du Back Office Shammah.",
};

export default function SigninPage() {
  return <LoginPanel />;
}
