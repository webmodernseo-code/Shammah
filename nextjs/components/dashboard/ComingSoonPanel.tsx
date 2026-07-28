export function ComingSoonPanel({ title }: { title: string }) {
  return (
    <main className="p-8">
      <div className="rounded-card bg-card-bg p-12 text-center shadow-card">
        <h1 className="text-2xl font-bold text-text-heading">{title}</h1>
        <p className="mt-2 text-text-body">Cette section arrive dans un prochain chantier.</p>
      </div>
    </main>
  );
}
