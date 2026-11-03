/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920],
  },
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async redirects() {
    return [
      // Redirection permanente (301) des anciennes pages de pont logistique / conciergerie vers la boutique
      { source: "/logistique/:path*", destination: "/shop-default", permanent: true },
      { source: "/logistique", destination: "/shop-default", permanent: true },
      { source: "/conciergerie/:path*", destination: "/shop-default", permanent: true },
      { source: "/conciergerie", destination: "/shop-default", permanent: true },
      { source: "/fret/:path*", destination: "/shop-default", permanent: true },
      { source: "/fret", destination: "/shop-default", permanent: true },
      { source: "/transit/:path*", destination: "/shop-default", permanent: true },
      { source: "/transit", destination: "/shop-default", permanent: true },
      { source: "/transport/:path*", destination: "/shop-default", permanent: true },
      { source: "/transport", destination: "/shop-default", permanent: true },
      { source: "/cotation/:path*", destination: "/shop-default", permanent: true },
      { source: "/cotation", destination: "/shop-default", permanent: true },
      { source: "/devis/:path*", destination: "/shop-default", permanent: true },
      { source: "/devis", destination: "/shop-default", permanent: true },
      { source: "/tarifs/:path*", destination: "/shop-default", permanent: true },
      { source: "/tarifs", destination: "/shop-default", permanent: true },
      { source: "/tarifs-fret/:path*", destination: "/shop-default", permanent: true },
      { source: "/tarifs-fret", destination: "/shop-default", permanent: true },
      { source: "/pont-logistique/:path*", destination: "/shop-default", permanent: true },
      { source: "/pont-logistique", destination: "/shop-default", permanent: true },
      { source: "/abidjan/:path*", destination: "/shop-default", permanent: true },
      { source: "/abidjan", destination: "/shop-default", permanent: true },
      { source: "/ouagadougou/:path*", destination: "/shop-default", permanent: true },
      { source: "/ouagadougou", destination: "/shop-default", permanent: true },
      { source: "/douane/:path*", destination: "/shop-default", permanent: true },
      { source: "/douane", destination: "/shop-default", permanent: true },
      { source: "/colis/:path*", destination: "/shop-default", permanent: true },
      { source: "/colis", destination: "/shop-default", permanent: true },
      { source: "/suivi-colis/:path*", destination: "/shop-default", permanent: true },
      { source: "/suivi-colis", destination: "/shop-default", permanent: true },
      { source: "/tracking/:path*", destination: "/shop-default", permanent: true },
      { source: "/tracking", destination: "/shop-default", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
