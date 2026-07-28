export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/produits/:path*", "/commandes/:path*", "/clients/:path*", "/attributs/:path*", "/promotions/:path*"],
};
