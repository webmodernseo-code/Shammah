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
    default: "Shammah | Vêtements et Accessoires Chrétiens | Boutique Officielle",
    template: "%s | Shammah",
  },
  description:
    "Boutique officielle Shammah : marque dédiée aux vêtements et accessoires chrétiens haut de gamme (t-shirts, sweats, hoodies, tote bags, casquettes, mugs et cadeaux chrétiens personnalisés). Créations inspirantes de foi et d'élégance imprimées en France.",
  applicationName: "Shammah",
  keywords: [
    "Shammah",
    "shammah.eu",
    "vêtements chrétiens",
    "mode chrétienne",
    "prêt-à-porter chrétien",
    "t-shirt chrétien",
    "sweat chrétien",
    "hoodie chrétien",
    "cadeau chrétien personnalisé",
    "boutique chrétienne",
    "print on demand France",
    "atelier d'impression France",
    "mode éthique et foi",
  ],
  authors: [{ name: "Shammah", url: SITE_URL }],
  creator: "Shammah",
  publisher: "Shammah",
  category: "clothing",
  alternates: { canonical: "/", languages: { "fr-FR": "/" } },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Shammah - Prêt-à-porter Chrétien",
    title: "Shammah | Prêt-à-porter Chrétien & Cadeaux Personnalisés",
    description:
      "Boutique officielle Shammah : prêt-à-porter, vêtements chrétiens et cadeaux personnalisés imprimés en France.",
    images: [{ url: "/images/slider/pod/slider-pod.jpg", width: 1440, height: 800, alt: "Créations chrétiennes Shammah" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shammah | Prêt-à-porter Chrétien & Cadeaux Personnalisés",
    description: "Boutique officielle de créations chrétiennes et prêt-à-porter imprimés à la demande.",
    images: ["/images/slider/pod/slider-pod.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["OnlineStore", "ClothingStore"],
  "@id": `${SITE_URL}/#store`,
  name: "Shammah",
  legalName: "Shammah",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/shammah-logo-black.png`,
  image: `${SITE_URL}/images/slider/pod/slider-pod.jpg`,
  email: "contact@shammah.eu",
  description:
    "Boutique en ligne officielle de prêt-à-porter, mode et vêtements chrétiens et cadeaux personnalisés imprimés à la demande en France.",
  disambiguatingDescription:
    "Marque de prêt-à-porter, habillement et création de vêtements chrétiens imprimés à la demande.",
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Credit Card, PayPal, Apple Pay",
  areaServed: [
    { "@type": "Country", name: "France" },
    { "@type": "City", name: "Paris" },
    { "@type": "AdministrativeArea", name: "Île-de-France" },
    { "@type": "City", name: "Grenoble" },
    { "@type": "Place", name: "Europe" },
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
