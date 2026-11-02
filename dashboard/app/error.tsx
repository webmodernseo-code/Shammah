"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Dashboard error", error); }, [error]);
  return <div className="min-h-[60vh] flex items-center justify-center p-6"><div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-xs"><div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-amber-50 text-amber-700"><span className="text-lg font-bold">!</span></div><h1 className="text-lg font-bold text-gray-900">Le dashboard n’a pas pu charger</h1><p className="mt-2 text-sm text-gray-500">Une erreur temporaire est survenue. Vos données n’ont pas été modifiées.</p><div className="mt-5 flex justify-center gap-3"><button onClick={reset} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Réessayer</button><button onClick={() => window.location.reload()} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Actualiser</button></div>{error.digest && <p className="mt-4 text-[11px] text-gray-400">Référence : {error.digest}</p>}</div></div>;
}
