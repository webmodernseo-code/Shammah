export async function queryNeon<T>(
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

  const url = new URL(databaseUrl);
  const endpoint = `https://${url.hostname}/sql`;
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": databaseUrl,
    },
    body: JSON.stringify({ query, params }),
  });

  if (!response.ok) throw new Error(`Neon HTTP request failed (${response.status}).`);
  const payload = await response.json() as { rows?: T[]; message?: string };
  if (payload.message) throw new Error(payload.message);
  return payload.rows || [];
}
