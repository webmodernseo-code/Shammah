"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[16px] bg-card-bg p-8 shadow-[0_4px_24px_rgba(17,24,39,0.06)]"
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-heading">DivinExpress</h1>
          <p className="mt-1 text-sm text-text-body">Administration</p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              className="block text-sm font-medium text-text-body"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-text-heading placeholder-gray-400 outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
              placeholder="admin@divinexpress.fr"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-text-body"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-text-heading outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p id="login-error" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-status-red">
            {error}
          </p>
        )}

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-accent-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-primary-hover disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
