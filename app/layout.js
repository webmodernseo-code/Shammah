import "../public/fonts/fonts.css";
import "../public/fonts/font-icons.css";
import "../public/css/bootstrap.min.css";
import "../public/css/swiper-bundle.min.css";
import "../public/css/animate.css";
import "../public/css/bootstrap-select.min.css";
import "../public/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";

import ClientShell from "@/components/layout/ClientShell";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shammah | Vêtements chrétiens & cadeaux personnalisés",
    template: "%s | Shammah",
  },
  description:
    "Vêtements chrétiens et cadeaux personnalisés imprimés à la demande. Livraison en France, à Paris, en Île-de-France, à Grenoble et en Afrique de l’Ouest.",
  applicationName: "Shammah",
  keywords: [
    "vêtements chrétiens",
    "t-shirt chrétien",
    "cadeau chrétien personnalisé",
    "print on demand France",
    "boutique chrétienne Paris",
    "vêtements chrétiens Grenoble",
    "mode chrétienne Afrique de l'Ouest",
  ],
  authors: [{ name: "Shammah", url: SITE_URL }],
  creator: "Shammah",
  publisher: "Shammah",
  category: "ecommerce",
  alternates: { canonical: "/", languages: { "fr-FR": "/" } },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Shammah",
    title: "Shammah | Vêtements chrétiens & cadeaux personnalisés",
    description:
      "Des créations chrétiennes porteuses de sens, livrées en France et en Afrique de l’Ouest.",
    images: [{ url: "/images/slider/pod/slider-pod.jpg", width: 1440, height: 800, alt: "Créations chrétiennes Shammah" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shammah | Vêtements chrétiens & cadeaux personnalisés",
    description: "Créations chrétiennes imprimées à la demande et livrées en France et en Afrique de l’Ouest.",
    images: ["/images/slider/pod/slider-pod.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${SITE_URL}/#store`,
  name: "Shammah",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/logo.svg`,
  email: "contact@shammah.eu",
  description: "Boutique de vêtements chrétiens et cadeaux personnalisés imprimés à la demande.",
  areaServed: [
    { "@type": "Country", name: "France" },
    { "@type": "City", name: "Paris" },
    { "@type": "AdministrativeArea", name: "Île-de-France" },
    { "@type": "City", name: "Grenoble" },
    { "@type": "Place", name: "Afrique de l’Ouest" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
