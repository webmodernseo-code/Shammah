import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Shammah Admin",
    default: "Shammah — Dashboard Administration",
  },
  description:
    "Tableau de bord de gestion et administration pour la boutique e-commerce Shammah.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=de_d_2026", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=de_d_2026", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=de_d_2026", sizes: "16x16", type: "image/png" },
      { url: "/icon.png?v=de_d_2026", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=de_d_2026", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=de_d_2026",
    apple: [
      { url: "/apple-icon.png?v=de_d_2026", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=de_d_2026" />
        <link rel="icon" href="/favicon.ico?v=de_d_2026" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=de_d_2026" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=de_d_2026" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon.png?v=de_d_2026" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png?v=de_d_2026" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
