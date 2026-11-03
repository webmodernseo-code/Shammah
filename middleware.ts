import { NextResponse, type NextRequest } from "next/server";

// Ces anciennes pages logistiques n'ont aucun équivalent dans la boutique.
// Le statut 410 évite de transférer leur ancienne pertinence vers l'e-commerce.
export function middleware(_request: NextRequest) {
  return new NextResponse("Ce service n’existe plus sur shammah.eu.", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const config = {
  matcher: [
    "/logistique/:path*", "/conciergerie/:path*", "/fret/:path*",
    "/transit/:path*", "/transport/:path*", "/cotation/:path*",
    "/devis/:path*", "/tarifs-fret/:path*", "/pont-logistique/:path*",
    "/abidjan/:path*", "/ouagadougou/:path*", "/douane/:path*",
    "/suivi-colis/:path*", "/tracking/:path*",
  ],
};
