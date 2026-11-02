import Link from "next/link";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";

export const metadata = {
  title: "Livraison France, Paris, Grenoble & Afrique de l’Ouest",
  description: "Livraison des vêtements chrétiens et cadeaux personnalisés Shammah à Paris, en Île-de-France, Grenoble, partout en France et en Afrique de l’Ouest.",
  alternates: { canonical: "/zones-livraison" },
  openGraph: {
    title: "Livraison Shammah en France et en Afrique de l’Ouest",
    description: "Commandez vos créations chrétiennes et faites-vous livrer à Paris, Grenoble, partout en France et en Afrique de l’Ouest.",
    url: "/zones-livraison",
  },
};

const zones = [
  { title: "Paris et Île-de-France", text: "Recevez nos t-shirts, sweats et cadeaux chrétiens à Paris et dans toute l’Île-de-France : Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Yvelines, Essonne, Val-d’Oise et Seine-et-Marne." },
  { title: "Grenoble et l’Isère", text: "Shammah livre ses créations personnalisées à Grenoble, dans sa métropole et partout en Isère." },
  { title: "Partout en France", text: "Nos collections imprimées à la demande sont disponibles à la livraison dans toutes les régions de France métropolitaine." },
  { title: "Afrique de l’Ouest", text: "Nous accompagnons aussi notre communauté en Afrique de l’Ouest. Les disponibilités, délais et frais dépendent du pays de destination ; contactez-nous avant votre commande pour confirmation." },
];

const faq = [
  ["Livrez-vous à Paris et en Île-de-France ?", "Oui, Shammah livre à Paris et dans tous les départements d’Île-de-France."],
  ["Puis-je commander depuis Grenoble ?", "Oui, la livraison est disponible à Grenoble, dans la métropole grenobloise et partout en Isère."],
  ["Quels pays d’Afrique de l’Ouest sont desservis ?", "La desserte varie selon les transporteurs. Contactez-nous avec votre ville et votre pays pour obtenir une confirmation précise avant commande."],
];

export default function ZonesLivraisonPage() {
  const schema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
  };
  return <>
    <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
    <Header2 />
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="flat-spacing-24">
        <div className="container">
          <div className="text-center mb-5">
            <p className="text-uppercase fw-medium">Shammah près de chez vous</p>
            <h1>Livraison en France et en Afrique de l’Ouest</h1>
            <p className="text-md">Des créations chrétiennes imprimées à la demande et expédiées vers votre région.</p>
          </div>
          <div className="row g-4">
            {zones.map((zone) => <article className="col-md-6" key={zone.title}>
              <div className="h-100 border p-4"><h2 className="h4">{zone.title}</h2><p>{zone.text}</p></div>
            </article>)}
          </div>
        </div>
      </section>
      <section className="flat-spacing-24 bg-light">
        <div className="container"><h2 className="text-center mb-4">Questions sur la livraison</h2>
          {faq.map(([question, answer]) => <div className="mb-3" key={question}><h3 className="h5">{question}</h3><p>{answer}</p></div>)}
          <div className="text-center mt-4"><Link href="/shop-default" className="tf-btn animate-btn">Voir la boutique</Link>{" "}<Link href="/contact-us" className="tf-btn btn-line-dark">Nous contacter</Link></div>
        </div>
      </section>
    </main>
    <Footer1 />
  </>;
}
