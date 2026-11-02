import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xs border border-gray-200">
        <div className="size-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="size-6" />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">Erreur 403 — Accès Restreint</p>
        <h1 className="text-2xl font-bold text-gray-900">Privilèges insuffisants</h1>
        <p className="mt-3 text-xs text-gray-500 max-w-sm mx-auto">
          Cette section nécessite des privilèges de super administrateur ou d'accès financier direct.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-colors shadow-sm"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </section>
    </main>
  );
}
